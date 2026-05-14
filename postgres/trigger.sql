BEGIN;

-- 1. Hàm tạo UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION fn_new_id(p_prefix TEXT)
RETURNS VARCHAR AS $$
BEGIN
    RETURN p_prefix || '_' || REPLACE(gen_random_uuid()::TEXT, '-', '');
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger tự động cập nhật updatedat
CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedat = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    r RECORD;
    v_trigger TEXT;
BEGIN
    FOR r IN
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = 'updatedat'
    LOOP
        v_trigger := 'trg_' || lower(r.table_name) || '_updatedat';
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', v_trigger, r.table_name);
        EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at()', v_trigger, r.table_name);
    END LOOP;
END $$;

-- 3. Hàm cập nhật Tồn kho
CREATE OR REPLACE FUNCTION fn_update_tonkho(p_macn VARCHAR, p_manl VARCHAR, p_delta NUMERIC)
RETURNS VOID AS $$
DECLARE
    v_current NUMERIC(18,2);
BEGIN
    SELECT soluongton INTO v_current
    FROM tonkho
    WHERE macn = p_macn AND manl = p_manl
    FOR UPDATE;

    IF NOT FOUND THEN
        IF p_delta < 0 THEN
            RAISE EXCEPTION 'Không đủ tồn kho. Chi nhánh %, nguyên liệu %, cần trừ %', p_macn, p_manl, ABS(p_delta);
        END IF;
        INSERT INTO tonkho(macn, manl, soluongton) VALUES (p_macn, p_manl, p_delta);
    ELSE
        IF v_current + p_delta < 0 THEN
            RAISE EXCEPTION 'Không đủ tồn kho. Chi nhánh %, nguyên liệu %, tồn hiện tại %, cần trừ %', p_macn, p_manl, v_current, ABS(p_delta);
        END IF;
        UPDATE tonkho SET soluongton = soluongton + p_delta WHERE macn = p_macn AND manl = p_manl;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. Hàm Ghi Log Inventory
CREATE OR REPLACE FUNCTION fn_insert_inventory_transaction(
    p_macn VARCHAR,
    p_manl VARCHAR,
    p_malo VARCHAR,
    p_loaichungtu VARCHAR,
    p_idchungtu VARCHAR,
    p_loaigiaodich INT, -- 1: Nhap, -1: Xuat
    p_soluong NUMERIC
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO inventorytransaction(matrans, macn, manl, malo, loaichungtu, idchungtu, loaigiaodich, soluong)
    VALUES (fn_new_id('INV'), p_macn, p_manl, p_malo, p_loaichungtu, p_idchungtu, p_loaigiaodich, ABS(p_soluong));
END;
$$ LANGUAGE plpgsql;

-- 5. Hàm Nhập Kho Lô
CREATE OR REPLACE FUNCTION fn_nhap_kho_lot(p_malo VARCHAR, p_macn VARCHAR, p_loaichungtu VARCHAR, p_idchungtu VARCHAR, p_soluong NUMERIC)
RETURNS VOID AS $$
DECLARE
    v_manl VARCHAR(50);
BEGIN
    SELECT manl INTO v_manl FROM lohang WHERE malo = p_malo AND macn = p_macn FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy lô hàng % tại chi nhánh %', p_malo, p_macn;
    END IF;

    UPDATE lohang SET soluongcon = soluongcon + p_soluong WHERE malo = p_malo;
    PERFORM fn_update_tonkho(p_macn, v_manl, p_soluong);
    PERFORM fn_insert_inventory_transaction(p_macn, v_manl, p_malo, p_loaichungtu, p_idchungtu, 1, p_soluong);
END;
$$ LANGUAGE plpgsql;

-- 6. Hàm Xuất Kho Lô
CREATE OR REPLACE FUNCTION fn_xuat_kho_lot(p_malo VARCHAR, p_macn VARCHAR, p_loaichungtu VARCHAR, p_idchungtu VARCHAR, p_loaigiaodich INT, p_soluong NUMERIC)
RETURNS VOID AS $$
DECLARE
    v_manl VARCHAR(50);
    v_con NUMERIC(18,2);
BEGIN
    SELECT manl, soluongcon INTO v_manl, v_con FROM lohang WHERE malo = p_malo AND macn = p_macn FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy lô hàng % tại chi nhánh %', p_malo, p_macn;
    END IF;
    IF v_con < p_soluong THEN
        RAISE EXCEPTION 'Lô % không đủ hàng. Còn %, cần %', p_malo, v_con, p_soluong;
    END IF;

    UPDATE lohang SET soluongcon = soluongcon - p_soluong WHERE malo = p_malo;
    PERFORM fn_update_tonkho(p_macn, v_manl, -p_soluong);
    PERFORM fn_insert_inventory_transaction(p_macn, v_manl, p_malo, p_loaichungtu, p_idchungtu, p_loaigiaodich, p_soluong);
END;
$$ LANGUAGE plpgsql;

-- 7. Hàm Xuất Kho FEFO
CREATE OR REPLACE FUNCTION fn_xuat_kho_fefo(p_macn VARCHAR, p_manl VARCHAR, p_loaichungtu VARCHAR, p_idchungtu VARCHAR, p_soluong NUMERIC)
RETURNS VOID AS $$
DECLARE
    v_need NUMERIC(18,2) := p_soluong;
    v_take NUMERIC(18,2);
    r RECORD;
BEGIN
    IF p_soluong <= 0 THEN
        RETURN;
    END IF;

    FOR r IN
        SELECT malo, soluongcon
        FROM lohang
        WHERE macn = p_macn AND manl = p_manl AND soluongcon > 0
        ORDER BY hsd NULLS LAST, ngaynhap, malo
        FOR UPDATE
    LOOP
        EXIT WHEN v_need <= 0;
        v_take := LEAST(v_need, r.soluongcon);
        UPDATE lohang SET soluongcon = soluongcon - v_take WHERE malo = r.malo;
        PERFORM fn_insert_inventory_transaction(p_macn, p_manl, r.malo, p_loaichungtu, p_idchungtu, -1, v_take);
        v_need := v_need - v_take;
    END LOOP;

    IF v_need > 0 THEN
        RAISE EXCEPTION 'Không đủ tồn kho nguyên liệu %. Chi nhánh %, còn thiếu %', p_manl, p_macn, v_need;
    END IF;

    PERFORM fn_update_tonkho(p_macn, p_manl, -p_soluong);
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger Cập nhật Trạng thái Hóa đơn sau khi Thanh toán
CREATE OR REPLACE FUNCTION fn_update_hoadon_after_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_paid NUMERIC(18,0);
    v_due NUMERIC(18,0);
BEGIN
    -- 2: Thanh toán thành công
    IF NEW.trangthai = 2 THEN 
        SELECT COALESCE(SUM(sotien),0) INTO v_paid FROM thanhtoan WHERE mahd = NEW.mahd AND trangthai = 2;
        SELECT tongtien INTO v_due FROM hoadon WHERE mahd = NEW.mahd;
        IF v_paid >= v_due THEN
            UPDATE hoadon SET trangthai = 2 WHERE mahd = NEW.mahd AND trangthai <> 2;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_thanhtoan_update_hoadon ON thanhtoan;
CREATE TRIGGER trg_thanhtoan_update_hoadon
AFTER INSERT OR UPDATE OF trangthai, sotien ON thanhtoan
FOR EACH ROW EXECUTE FUNCTION fn_update_hoadon_after_payment();

-- 9. Trigger Trừ Kho Khi Hóa Đơn Hoàn Thành
CREATE OR REPLACE FUNCTION fn_process_hoadon_tru_kho()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    recipe RECORD;
    v_mapb VARCHAR(50);
    v_need NUMERIC(18,2);
BEGIN
    -- 2: Đã thanh toán (Hoàn thành)
    IF NEW.trangthai = 2 AND OLD.trangthai <> 2 THEN
        FOR item IN
            SELECT id, masp, soluong FROM cthd WHERE mahd = NEW.mahd AND (idmonchinh IS NULL OR idmonchinh = '')
        LOOP
            SELECT mapb INTO v_mapb
            FROM phienbancongthuc
            WHERE masp = item.masp AND trangthai = 1 AND ngayhieuluc <= CURRENT_TIMESTAMP
            ORDER BY ngayhieuluc DESC
            LIMIT 1;

            IF v_mapb IS NOT NULL THEN
                FOR recipe IN SELECT manl, soluong FROM dinhmuccongthuc WHERE mapb = v_mapb LOOP
                    v_need := recipe.soluong * item.soluong;
                    PERFORM fn_xuat_kho_fefo(NEW.macn, recipe.manl, 'HOADON', NEW.mahd, v_need);
                END LOOP;
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hoadon_tru_kho ON hoadon;
CREATE TRIGGER trg_hoadon_tru_kho
AFTER UPDATE OF trangthai ON hoadon
FOR EACH ROW EXECUTE FUNCTION fn_process_hoadon_tru_kho();

COMMIT;