/* =========================================================
   03_TRIGGER_FIXED.SQL - POSTGRESQL
   Tự động cập nhật UpdatedAt, tính tiền hóa đơn, thanh toán,
   trừ kho theo recipe, nhập/xuất/chuyển/kiểm kho.
   ========================================================= */

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION fn_new_id(p_prefix TEXT)
RETURNS VARCHAR AS $$
BEGIN
    RETURN p_prefix || '_' || REPLACE(gen_random_uuid()::TEXT, '-', '');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.UpdatedAt = CURRENT_TIMESTAMP;
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

CREATE OR REPLACE FUNCTION fn_update_tonkho(p_macn VARCHAR, p_manl VARCHAR, p_delta NUMERIC)
RETURNS VOID AS $$
DECLARE
    v_current NUMERIC(18,2);
BEGIN
    SELECT SoLuongTon INTO v_current
    FROM TONKHO
    WHERE MaCN = p_macn AND MaNL = p_manl
    FOR UPDATE;

    IF NOT FOUND THEN
        IF p_delta < 0 THEN
            RAISE EXCEPTION 'Không đủ tồn kho. Chi nhánh %, nguyên liệu %, cần trừ %', p_macn, p_manl, ABS(p_delta);
        END IF;
        INSERT INTO TONKHO(MaCN, MaNL, SoLuongTon) VALUES (p_macn, p_manl, p_delta);
    ELSE
        IF v_current + p_delta < 0 THEN
            RAISE EXCEPTION 'Không đủ tồn kho. Chi nhánh %, nguyên liệu %, tồn hiện tại %, cần trừ %', p_macn, p_manl, v_current, ABS(p_delta);
        END IF;
        UPDATE TONKHO SET SoLuongTon = SoLuongTon + p_delta WHERE MaCN = p_macn AND MaNL = p_manl;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_insert_inventory_transaction(
    p_macn VARCHAR,
    p_manl VARCHAR,
    p_malo VARCHAR,
    p_loaichungtu VARCHAR,
    p_idchungtu VARCHAR,
    p_loaigiaodich VARCHAR,
    p_soluong NUMERIC
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO INVENTORYTRANSACTION(MaTrans, MaCN, MaNL, MaLo, LoaiChungTu, IDChungTu, LoaiGiaoDich, SoLuong)
    VALUES (fn_new_id('INV'), p_macn, p_manl, p_malo, p_loaichungtu, p_idchungtu, p_loaigiaodich, ABS(p_soluong));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_nhap_kho_lot(p_malo VARCHAR, p_macn VARCHAR, p_loaichungtu VARCHAR, p_idchungtu VARCHAR, p_soluong NUMERIC)
RETURNS VOID AS $$
DECLARE
    v_manl VARCHAR(50);
BEGIN
    SELECT MaNL INTO v_manl FROM LOHANG WHERE MaLo = p_malo AND MaCN = p_macn FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy lô hàng % tại chi nhánh %', p_malo, p_macn;
    END IF;

    UPDATE LOHANG SET SoLuongCon = SoLuongCon + p_soluong WHERE MaLo = p_malo;
    PERFORM fn_update_tonkho(p_macn, v_manl, p_soluong);
    PERFORM fn_insert_inventory_transaction(p_macn, v_manl, p_malo, p_loaichungtu, p_idchungtu, 'NHAP', p_soluong);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_xuat_kho_lot(p_malo VARCHAR, p_macn VARCHAR, p_loaichungtu VARCHAR, p_idchungtu VARCHAR, p_loaigiaodich VARCHAR, p_soluong NUMERIC)
RETURNS VOID AS $$
DECLARE
    v_manl VARCHAR(50);
    v_con NUMERIC(18,2);
BEGIN
    SELECT MaNL, SoLuongCon INTO v_manl, v_con FROM LOHANG WHERE MaLo = p_malo AND MaCN = p_macn FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy lô hàng % tại chi nhánh %', p_malo, p_macn;
    END IF;
    IF v_con < p_soluong THEN
        RAISE EXCEPTION 'Lô % không đủ hàng. Còn %, cần %', p_malo, v_con, p_soluong;
    END IF;

    UPDATE LOHANG SET SoLuongCon = SoLuongCon - p_soluong WHERE MaLo = p_malo;
    PERFORM fn_update_tonkho(p_macn, v_manl, -p_soluong);
    PERFORM fn_insert_inventory_transaction(p_macn, v_manl, p_malo, p_loaichungtu, p_idchungtu, p_loaigiaodich, p_soluong);
END;
$$ LANGUAGE plpgsql;

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
        SELECT MaLo, SoLuongCon
        FROM LOHANG
        WHERE MaCN = p_macn AND MaNL = p_manl AND SoLuongCon > 0
        ORDER BY HSD NULLS LAST, NgayNhap, MaLo
        FOR UPDATE
    LOOP
        EXIT WHEN v_need <= 0;
        v_take := LEAST(v_need, r.SoLuongCon);
        UPDATE LOHANG SET SoLuongCon = SoLuongCon - v_take WHERE MaLo = r.MaLo;
        PERFORM fn_insert_inventory_transaction(p_macn, p_manl, r.MaLo, p_loaichungtu, p_idchungtu, 'XUAT', v_take);
        v_need := v_need - v_take;
    END LOOP;

    IF v_need > 0 THEN
        RAISE EXCEPTION 'Không đủ tồn kho nguyên liệu %. Chi nhánh %, còn thiếu %', p_manl, p_macn, v_need;
    END IF;

    PERFORM fn_update_tonkho(p_macn, p_manl, -p_soluong);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_refresh_hoadon_total(p_mahd VARCHAR)
RETURNS VOID AS $$
DECLARE
    v_tong NUMERIC(18,0);
    v_tiengiam NUMERIC(18,0) := 0;
    v_makm VARCHAR(50);
    v_loai VARCHAR(20);
    v_giatri NUMERIC(18,2);
    v_dieukien NUMERIC(18,0);
    v_max NUMERIC(18,0);
BEGIN
    SELECT COALESCE(SUM(SoLuong * GiaBanTaiThoiDiem), 0) INTO v_tong FROM CTHD WHERE MaHD = p_mahd;
    SELECT MaKM INTO v_makm FROM HOADON WHERE MaHD = p_mahd;

    IF v_makm IS NOT NULL THEN
        SELECT LoaiKM, GiaTri, DieuKienToiThieu, GiaTriGiamToiDa
        INTO v_loai, v_giatri, v_dieukien, v_max
        FROM KHUYENMAI
        WHERE MaKM = v_makm
          AND TrangThai = 'Hoạt động'
          AND CURRENT_TIMESTAMP BETWEEN NgayBatDau AND NgayKetThuc
          AND (SoLuong IS NULL OR SoLuongDaDung < SoLuong OR EXISTS (
              SELECT 1 FROM HOADON WHERE MaHD = p_mahd AND TrangThai = 'Đã thanh toán'
          ));

        IF FOUND AND v_tong >= v_dieukien THEN
            IF v_loai = 'PERCENT' THEN
                v_tiengiam := ROUND(v_tong * v_giatri / 100);
                IF v_max IS NOT NULL THEN
                    v_tiengiam := LEAST(v_tiengiam, v_max);
                END IF;
            ELSE
                v_tiengiam := v_giatri;
            END IF;
            v_tiengiam := LEAST(v_tiengiam, v_tong);
        ELSE
            v_tiengiam := 0;
        END IF;
    END IF;

    UPDATE HOADON
    SET TongTien = v_tong,
        TienGiam = v_tiengiam,
        TongTienSauGiam = GREATEST(v_tong - v_tiengiam, 0)
    WHERE MaHD = p_mahd;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_trigger_refresh_hoadon_total()
RETURNS TRIGGER AS $$
DECLARE
    v_mahd VARCHAR(50);
BEGIN
    v_mahd := COALESCE(NEW.MaHD, OLD.MaHD);
    PERFORM fn_refresh_hoadon_total(v_mahd);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cthd_refresh_hoadon_total ON CTHD;
CREATE TRIGGER trg_cthd_refresh_hoadon_total
AFTER INSERT OR UPDATE OR DELETE ON CTHD
FOR EACH ROW EXECUTE FUNCTION fn_trigger_refresh_hoadon_total();

CREATE OR REPLACE FUNCTION fn_trigger_hoadon_refresh_km()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.MaKM IS DISTINCT FROM OLD.MaKM THEN
        PERFORM fn_refresh_hoadon_total(NEW.MaHD);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hoadon_refresh_km ON HOADON;
CREATE TRIGGER trg_hoadon_refresh_km
AFTER UPDATE OF MaKM ON HOADON
FOR EACH ROW EXECUTE FUNCTION fn_trigger_hoadon_refresh_km();

CREATE OR REPLACE FUNCTION fn_update_hoadon_after_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_paid NUMERIC(18,0);
    v_due NUMERIC(18,0);
BEGIN
    IF NEW.TrangThai = 'Thành công' THEN
        PERFORM fn_refresh_hoadon_total(NEW.MaHD);
        SELECT COALESCE(SUM(SoTien),0) INTO v_paid FROM THANHTOAN WHERE MaHD = NEW.MaHD AND TrangThai = 'Thành công';
        SELECT TongTienSauGiam INTO v_due FROM HOADON WHERE MaHD = NEW.MaHD;
        IF v_paid >= v_due THEN
            UPDATE HOADON SET TrangThai = 'Đã thanh toán' WHERE MaHD = NEW.MaHD AND TrangThai <> 'Đã thanh toán';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_thanhtoan_update_hoadon ON THANHTOAN;
CREATE TRIGGER trg_thanhtoan_update_hoadon
AFTER INSERT OR UPDATE OF TrangThai, SoTien ON THANHTOAN
FOR EACH ROW EXECUTE FUNCTION fn_update_hoadon_after_payment();

CREATE OR REPLACE FUNCTION fn_update_khuyenmai_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF OLD.TrangThai <> 'Đã thanh toán' AND NEW.TrangThai = 'Đã thanh toán' AND NEW.MaKM IS NOT NULL THEN
            UPDATE KHUYENMAI SET SoLuongDaDung = SoLuongDaDung + 1 WHERE MaKM = NEW.MaKM;
        ELSIF OLD.TrangThai = 'Đã thanh toán' AND NEW.TrangThai <> 'Đã thanh toán' AND OLD.MaKM IS NOT NULL THEN
            UPDATE KHUYENMAI SET SoLuongDaDung = GREATEST(SoLuongDaDung - 1, 0) WHERE MaKM = OLD.MaKM;
        ELSIF OLD.TrangThai = 'Đã thanh toán' AND NEW.TrangThai = 'Đã thanh toán' AND OLD.MaKM IS DISTINCT FROM NEW.MaKM THEN
            IF OLD.MaKM IS NOT NULL THEN
                UPDATE KHUYENMAI SET SoLuongDaDung = GREATEST(SoLuongDaDung - 1, 0) WHERE MaKM = OLD.MaKM;
            END IF;
            IF NEW.MaKM IS NOT NULL THEN
                UPDATE KHUYENMAI SET SoLuongDaDung = SoLuongDaDung + 1 WHERE MaKM = NEW.MaKM;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hoadon_update_khuyenmai_usage ON HOADON;
CREATE TRIGGER trg_hoadon_update_khuyenmai_usage
AFTER UPDATE OF TrangThai, MaKM ON HOADON
FOR EACH ROW EXECUTE FUNCTION fn_update_khuyenmai_usage();

CREATE OR REPLACE FUNCTION fn_process_phieunhap()
RETURNS TRIGGER AS $$
DECLARE
    r RECORD;
BEGIN
    IF NEW.TrangThai = 'Đã nhập kho' AND NEW.DaXuLyKho = FALSE THEN
        FOR r IN SELECT c.MaLo, c.SoLuong FROM CTPN c WHERE c.MaPN = NEW.MaPN LOOP
            PERFORM fn_nhap_kho_lot(r.MaLo, NEW.MaCN, 'PHIEUNHAP', NEW.MaPN, r.SoLuong);
        END LOOP;
        UPDATE PHIEUNHAP SET DaXuLyKho = TRUE WHERE MaPN = NEW.MaPN;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_process_phieunhap ON PHIEUNHAP;
CREATE TRIGGER trg_process_phieunhap
AFTER UPDATE OF TrangThai ON PHIEUNHAP
FOR EACH ROW EXECUTE FUNCTION fn_process_phieunhap();

CREATE OR REPLACE FUNCTION fn_process_phieuxuat()
RETURNS TRIGGER AS $$
DECLARE
    r RECORD;
BEGIN
    IF NEW.TrangThai = 'Đã xuất kho' AND NEW.DaXuLyKho = FALSE THEN
        FOR r IN SELECT c.MaLo, c.SoLuong FROM CTPX c WHERE c.MaPX = NEW.MaPX LOOP
            PERFORM fn_xuat_kho_lot(r.MaLo, NEW.MaCN, 'PHIEUXUAT', NEW.MaPX, 'XUAT', r.SoLuong);
        END LOOP;
        UPDATE PHIEUXUAT SET DaXuLyKho = TRUE WHERE MaPX = NEW.MaPX;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_process_phieuxuat ON PHIEUXUAT;
CREATE TRIGGER trg_process_phieuxuat
AFTER UPDATE OF TrangThai ON PHIEUXUAT
FOR EACH ROW EXECUTE FUNCTION fn_process_phieuxuat();

CREATE OR REPLACE FUNCTION fn_process_phieuchuyen()
RETURNS TRIGGER AS $$
DECLARE
    r RECORD;
    v_malo_dest VARCHAR(80);
BEGIN
    IF NEW.TrangThai = 'Đang chuyển' AND NEW.DaXuLyKho = FALSE THEN
        FOR r IN
            SELECT c.MaLo, c.SoLuong, l.MaNL
            FROM CTPC c JOIN LOHANG l ON l.MaLo = c.MaLo
            WHERE c.MaPC = NEW.MaPC
        LOOP
            PERFORM fn_xuat_kho_lot(r.MaLo, NEW.MaCN_Xuat, 'PHIEUCHUYEN', NEW.MaPC, 'CHUYEN_DI', r.SoLuong);
        END LOOP;
        UPDATE PHIEUCHUYEN SET DaXuLyKho = TRUE WHERE MaPC = NEW.MaPC;
    END IF;

    IF NEW.TrangThai = 'Đã nhận' AND NEW.DaXuLyKho = TRUE AND NEW.DaNhanKho = FALSE THEN
        FOR r IN
            SELECT c.MaLo, c.SoLuong, l.MaNL, l.HSD
            FROM CTPC c JOIN LOHANG l ON l.MaLo = c.MaLo
            WHERE c.MaPC = NEW.MaPC
        LOOP
            v_malo_dest := LEFT(r.MaLo || '_' || NEW.MaCN_Nhap, 50);
            INSERT INTO LOHANG(MaLo, MaNL, MaCN, NgayNhap, HSD, SoLuongCon)
            VALUES (v_malo_dest, r.MaNL, NEW.MaCN_Nhap, CURRENT_TIMESTAMP, r.HSD, 0)
            ON CONFLICT (MaLo) DO NOTHING;

            UPDATE LOHANG SET SoLuongCon = SoLuongCon + r.SoLuong WHERE MaLo = v_malo_dest;
            PERFORM fn_update_tonkho(NEW.MaCN_Nhap, r.MaNL, r.SoLuong);
            PERFORM fn_insert_inventory_transaction(NEW.MaCN_Nhap, r.MaNL, v_malo_dest, 'PHIEUCHUYEN', NEW.MaPC, 'CHUYEN_DEN', r.SoLuong);
        END LOOP;
        UPDATE PHIEUCHUYEN SET DaNhanKho = TRUE WHERE MaPC = NEW.MaPC;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_process_phieuchuyen ON PHIEUCHUYEN;
CREATE TRIGGER trg_process_phieuchuyen
AFTER UPDATE OF TrangThai ON PHIEUCHUYEN
FOR EACH ROW EXECUTE FUNCTION fn_process_phieuchuyen();

CREATE OR REPLACE FUNCTION fn_process_kiemkho()
RETURNS TRIGGER AS $$
DECLARE
    r RECORD;
    v_delta NUMERIC(18,2);
BEGIN
    IF NEW.TrangThai = 'Đã xác nhận' AND NEW.DaXuLyKho = FALSE THEN
        FOR r IN SELECT * FROM CTKK WHERE MaKK = NEW.MaKK LOOP
            v_delta := r.SoLuongThucTe - r.SoLuongHeThong;
            IF v_delta <> 0 THEN
                PERFORM fn_update_tonkho(NEW.MaCN, r.MaNL, v_delta);
                PERFORM fn_insert_inventory_transaction(
                    NEW.MaCN,
                    r.MaNL,
                    NULL,
                    'KIEMKHO',
                    NEW.MaKK,
                    CASE WHEN v_delta > 0 THEN 'DIEU_CHINH_TANG' ELSE 'DIEU_CHINH_GIAM' END,
                    ABS(v_delta)
                );
            END IF;
        END LOOP;
        UPDATE KIEMKHO SET DaXuLyKho = TRUE WHERE MaKK = NEW.MaKK;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_process_kiemkho ON KIEMKHO;
CREATE TRIGGER trg_process_kiemkho
AFTER UPDATE OF TrangThai ON KIEMKHO
FOR EACH ROW EXECUTE FUNCTION fn_process_kiemkho();

CREATE OR REPLACE FUNCTION fn_process_hoadon_tru_kho()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    recipe RECORD;
    v_mapb VARCHAR(50);
    v_need NUMERIC(18,2);
BEGIN
    IF NEW.TrangThai = 'Đã thanh toán' AND OLD.TrangThai <> 'Đã thanh toán' THEN
        FOR item IN
            SELECT ID, MaSP, SoLuong FROM CTHD WHERE MaHD = NEW.MaHD AND DaTruKho = FALSE
        LOOP
            SELECT MaPB INTO v_mapb
            FROM PHIENBANCONGTHUC
            WHERE MaSP = item.MaSP AND TrangThai = 'Hoạt động' AND NgayHieuLuc <= CURRENT_TIMESTAMP
            ORDER BY NgayHieuLuc DESC
            LIMIT 1;

            IF v_mapb IS NOT NULL THEN
                FOR recipe IN SELECT MaNL, SoLuong FROM DINHMUCCONGTHUC WHERE MaPB = v_mapb LOOP
                    v_need := recipe.SoLuong * item.SoLuong;
                    PERFORM fn_xuat_kho_fefo(NEW.MaCN, recipe.MaNL, 'HOADON', NEW.MaHD, v_need);
                END LOOP;
            END IF;

            UPDATE CTHD SET DaTruKho = TRUE WHERE ID = item.ID;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hoadon_tru_kho ON HOADON;
CREATE TRIGGER trg_hoadon_tru_kho
AFTER UPDATE OF TrangThai ON HOADON
FOR EACH ROW EXECUTE FUNCTION fn_process_hoadon_tru_kho();
