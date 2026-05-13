/* =========================================================
   TRIGGER MODULE - POSTGRESQL
   Dùng cho database Phụng Lộc Coffee
   ========================================================= */


/* =========================================================
   0. EXTENSION TẠO UUID
   ========================================================= */

CREATE EXTENSION IF NOT EXISTS pgcrypto;


/* =========================================================
   1. BỔ SUNG CỘT ĐÁNH DẤU ĐÃ XỬ LÝ KHO
   ========================================================= */

ALTER TABLE PHIEUNHAP
ADD COLUMN IF NOT EXISTS DaXuLyKho BOOLEAN DEFAULT FALSE;

ALTER TABLE PHIEUXUAT
ADD COLUMN IF NOT EXISTS DaXuLyKho BOOLEAN DEFAULT FALSE;

ALTER TABLE PHIEUCHUYEN
ADD COLUMN IF NOT EXISTS DaXuLyKho BOOLEAN DEFAULT FALSE;

ALTER TABLE KIEMKHO
ADD COLUMN IF NOT EXISTS DaXuLyKho BOOLEAN DEFAULT FALSE;


/* =========================================================
   2. HÀM TẠO ID
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_new_id(p_prefix TEXT)
RETURNS VARCHAR AS $$
BEGIN
    RETURN p_prefix || '_' || REPLACE(gen_random_uuid()::TEXT, '-', '');
END;
$$ LANGUAGE plpgsql;


/* =========================================================
   3. TRIGGER UpdatedAt
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.UpdatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


/* =========================================================
   4. GẮN TRIGGER UpdatedAt CHO CÁC BẢNG CÓ UpdatedAt
   ========================================================= */

DROP TRIGGER IF EXISTS trg_chinhanh_updatedat ON CHINHANH;
CREATE TRIGGER trg_chinhanh_updatedat
BEFORE UPDATE ON CHINHANH
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_donvi_updatedat ON DONVI;
CREATE TRIGGER trg_donvi_updatedat
BEFORE UPDATE ON DONVI
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_nhacungcap_updatedat ON NHACUNGCAP;
CREATE TRIGGER trg_nhacungcap_updatedat
BEFORE UPDATE ON NHACUNGCAP
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_sanpham_updatedat ON SANPHAM;
CREATE TRIGGER trg_sanpham_updatedat
BEFORE UPDATE ON SANPHAM
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_khuyenmai_updatedat ON KHUYENMAI;
CREATE TRIGGER trg_khuyenmai_updatedat
BEFORE UPDATE ON KHUYENMAI
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_nhanvien_updatedat ON NHANVIEN;
CREATE TRIGGER trg_nhanvien_updatedat
BEFORE UPDATE ON NHANVIEN
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_taikhoan_updatedat ON TAIKHOAN;
CREATE TRIGGER trg_taikhoan_updatedat
BEFORE UPDATE ON TAIKHOAN
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_nguyenlieu_updatedat ON NGUYENLIEU;
CREATE TRIGGER trg_nguyenlieu_updatedat
BEFORE UPDATE ON NGUYENLIEU
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_quydoidonvi_updatedat ON QUYDOIDONVI;
CREATE TRIGGER trg_quydoidonvi_updatedat
BEFORE UPDATE ON QUYDOIDONVI
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_phienbancongthuc_updatedat ON PHIENBANCONGTHUC;
CREATE TRIGGER trg_phienbancongthuc_updatedat
BEFORE UPDATE ON PHIENBANCONGTHUC
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_calamviec_updatedat ON CALAMVIEC;
CREATE TRIGGER trg_calamviec_updatedat
BEFORE UPDATE ON CALAMVIEC
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_hoadon_updatedat ON HOADON;
CREATE TRIGGER trg_hoadon_updatedat
BEFORE UPDATE ON HOADON
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_cthd_updatedat ON CTHD;
CREATE TRIGGER trg_cthd_updatedat
BEFORE UPDATE ON CTHD
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_thanhtoan_updatedat ON THANHTOAN;
CREATE TRIGGER trg_thanhtoan_updatedat
BEFORE UPDATE ON THANHTOAN
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_tonkho_updatedat ON TONKHO;
CREATE TRIGGER trg_tonkho_updatedat
BEFORE UPDATE ON TONKHO
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_lohang_updatedat ON LOHANG;
CREATE TRIGGER trg_lohang_updatedat
BEFORE UPDATE ON LOHANG
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_kiemkho_updatedat ON KIEMKHO;
CREATE TRIGGER trg_kiemkho_updatedat
BEFORE UPDATE ON KIEMKHO
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_ctkk_updatedat ON CTKK;
CREATE TRIGGER trg_ctkk_updatedat
BEFORE UPDATE ON CTKK
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_phieunhap_updatedat ON PHIEUNHAP;
CREATE TRIGGER trg_phieunhap_updatedat
BEFORE UPDATE ON PHIEUNHAP
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_ctpn_updatedat ON CTPN;
CREATE TRIGGER trg_ctpn_updatedat
BEFORE UPDATE ON CTPN
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_phieuxuat_updatedat ON PHIEUXUAT;
CREATE TRIGGER trg_phieuxuat_updatedat
BEFORE UPDATE ON PHIEUXUAT
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_ctpx_updatedat ON CTPX;
CREATE TRIGGER trg_ctpx_updatedat
BEFORE UPDATE ON CTPX
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_phieuchuyen_updatedat ON PHIEUCHUYEN;
CREATE TRIGGER trg_phieuchuyen_updatedat
BEFORE UPDATE ON PHIEUCHUYEN
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_ctpc_updatedat ON CTPC;
CREATE TRIGGER trg_ctpc_updatedat
BEFORE UPDATE ON CTPC
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_inventory_updatedat ON INVENTORYTRANSACTION;
CREATE TRIGGER trg_inventory_updatedat
BEFORE UPDATE ON INVENTORYTRANSACTION
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_synclog_updatedat ON SYNCLOG;
CREATE TRIGGER trg_synclog_updatedat
BEFORE UPDATE ON SYNCLOG
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_conflictlog_updatedat ON CONFLICTLOG;
CREATE TRIGGER trg_conflictlog_updatedat
BEFORE UPDATE ON CONFLICTLOG
FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();


/* =========================================================
   5. HÀM CẬP NHẬT TỒN KHO TỔNG
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_update_tonkho(
    p_macn VARCHAR,
    p_manl VARCHAR,
    p_delta DECIMAL
)
RETURNS VOID AS $$
DECLARE
    v_current DECIMAL(18,2);
BEGIN
    SELECT SoLuongTon
    INTO v_current
    FROM TONKHO
    WHERE MaCN = p_macn
      AND MaNL = p_manl
    FOR UPDATE;

    IF v_current IS NULL THEN
        IF p_delta < 0 THEN
            RAISE EXCEPTION 'Không đủ tồn kho. Chi nhánh %, nguyên liệu %, cần trừ %',
                p_macn, p_manl, ABS(p_delta);
        END IF;

        INSERT INTO TONKHO (
            MaCN,
            MaNL,
            SoLuongTon,
            CreatedAt,
            UpdatedAt
        )
        VALUES (
            p_macn,
            p_manl,
            p_delta,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
    ELSE
        IF v_current + p_delta < 0 THEN
            RAISE EXCEPTION 'Không đủ tồn kho. Chi nhánh %, nguyên liệu %, tồn hiện tại %, cần trừ %',
                p_macn, p_manl, v_current, ABS(p_delta);
        END IF;

        UPDATE TONKHO
        SET SoLuongTon = SoLuongTon + p_delta,
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE MaCN = p_macn
          AND MaNL = p_manl;
    END IF;
END;
$$ LANGUAGE plpgsql;


/* =========================================================
   6. HÀM GHI NHẬT KÝ KHO
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_insert_inventory_transaction(
    p_macn VARCHAR,
    p_manl VARCHAR,
    p_malo VARCHAR,
    p_loaichungtu VARCHAR,
    p_idchungtu VARCHAR,
    p_loaigiaodich INT,
    p_soluong DECIMAL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO INVENTORYTRANSACTION (
        MaTrans,
        MaCN,
        MaNL,
        MaLo,
        LoaiChungTu,
        IDChungTu,
        LoaiGiaoDich,
        SoLuong,
        TrangThai,
        IsSynced,
        CreatedAt,
        UpdatedAt
    )
    VALUES (
        fn_new_id('TRANS'),
        p_macn,
        p_manl,
        p_malo,
        p_loaichungtu,
        p_idchungtu,
        p_loaigiaodich,
        p_soluong,
        1,
        FALSE,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql;


/* =========================================================
   7. HÀM NHẬP KHO VÀO LÔ
   Quy ước: khi tạo LOHANG ban đầu, SoLuongCon nên để 0.
   Khi PHIEUNHAP xác nhận, trigger sẽ cộng SoLuongCon.
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_nhap_kho_lot(
    p_malo VARCHAR,
    p_soluong DECIMAL,
    p_loaichungtu VARCHAR,
    p_idchungtu VARCHAR,
    p_loaigiaodich INT
)
RETURNS VOID AS $$
DECLARE
    v_macn VARCHAR(20);
    v_manl VARCHAR(50);
BEGIN
    SELECT MaCN, MaNL
    INTO v_macn, v_manl
    FROM LOHANG
    WHERE MaLo = p_malo
    FOR UPDATE;

    IF v_macn IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy lô hàng %', p_malo;
    END IF;

    IF p_soluong <= 0 THEN
        RAISE EXCEPTION 'Số lượng nhập kho phải > 0';
    END IF;

    UPDATE LOHANG
    SET SoLuongCon = SoLuongCon + p_soluong,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE MaLo = p_malo;

    PERFORM fn_update_tonkho(v_macn, v_manl, p_soluong);

    PERFORM fn_insert_inventory_transaction(
        v_macn,
        v_manl,
        p_malo,
        p_loaichungtu,
        p_idchungtu,
        p_loaigiaodich,
        p_soluong
    );
END;
$$ LANGUAGE plpgsql;


/* =========================================================
   8. HÀM XUẤT KHO THEO LÔ CỤ THỂ
   Dùng cho PHIEUXUAT và PHIEUCHUYEN
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_xuat_kho_lot(
    p_malo VARCHAR,
    p_soluong DECIMAL,
    p_loaichungtu VARCHAR,
    p_idchungtu VARCHAR,
    p_loaigiaodich INT
)
RETURNS VOID AS $$
DECLARE
    v_macn VARCHAR(20);
    v_manl VARCHAR(50);
    v_soluongcon DECIMAL(18,2);
BEGIN
    SELECT MaCN, MaNL, SoLuongCon
    INTO v_macn, v_manl, v_soluongcon
    FROM LOHANG
    WHERE MaLo = p_malo
    FOR UPDATE;

    IF v_macn IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy lô hàng %', p_malo;
    END IF;

    IF p_soluong <= 0 THEN
        RAISE EXCEPTION 'Số lượng xuất kho phải > 0';
    END IF;

    IF v_soluongcon < p_soluong THEN
        RAISE EXCEPTION 'Lô hàng % không đủ số lượng. Còn %, cần xuất %',
            p_malo, v_soluongcon, p_soluong;
    END IF;

    UPDATE LOHANG
    SET SoLuongCon = SoLuongCon - p_soluong,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE MaLo = p_malo;

    PERFORM fn_update_tonkho(v_macn, v_manl, -p_soluong);

    PERFORM fn_insert_inventory_transaction(
        v_macn,
        v_manl,
        p_malo,
        p_loaichungtu,
        p_idchungtu,
        p_loaigiaodich,
        p_soluong
    );
END;
$$ LANGUAGE plpgsql;


/* =========================================================
   9. HÀM XUẤT KHO FEFO/FIFO
   Dùng cho bán hàng theo công thức và kiểm kho âm.
   Ưu tiên lô gần hết hạn trước.
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_xuat_kho_fefo(
    p_macn VARCHAR,
    p_manl VARCHAR,
    p_soluong DECIMAL,
    p_loaichungtu VARCHAR,
    p_idchungtu VARCHAR,
    p_loaigiaodich INT
)
RETURNS VOID AS $$
DECLARE
    r_lot RECORD;
    v_remaining DECIMAL(18,2);
    v_take DECIMAL(18,2);
BEGIN
    IF p_soluong <= 0 THEN
        RAISE EXCEPTION 'Số lượng xuất kho phải > 0';
    END IF;

    v_remaining := p_soluong;

    FOR r_lot IN
        SELECT MaLo, SoLuongCon
        FROM LOHANG
        WHERE MaCN = p_macn
          AND MaNL = p_manl
          AND SoLuongCon > 0
        ORDER BY HSD ASC NULLS LAST, NgayNhap ASC, MaLo ASC
        FOR UPDATE
    LOOP
        EXIT WHEN v_remaining <= 0;

        v_take := LEAST(v_remaining, r_lot.SoLuongCon);

        UPDATE LOHANG
        SET SoLuongCon = SoLuongCon - v_take,
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE MaLo = r_lot.MaLo;

        v_remaining := v_remaining - v_take;
    END LOOP;

    IF v_remaining > 0 THEN
        RAISE EXCEPTION 'Không đủ nguyên liệu %. Chi nhánh %, thiếu %',
            p_manl, p_macn, v_remaining;
    END IF;

    PERFORM fn_update_tonkho(p_macn, p_manl, -p_soluong);

    PERFORM fn_insert_inventory_transaction(
        p_macn,
        p_manl,
        NULL,
        p_loaichungtu,
        p_idchungtu,
        p_loaigiaodich,
        p_soluong
    );
END;
$$ LANGUAGE plpgsql;


/* =========================================================
   10. TỰ TÍNH LẠI TỔNG TIỀN HÓA ĐƠN
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_refresh_hoadon_total(p_mahd VARCHAR)
RETURNS VOID AS $$
DECLARE
    v_tongtien DECIMAL(18,0);
    v_tiengiam DECIMAL(18,0);
    v_tongsaugiam DECIMAL(18,0);

    v_makm VARCHAR(50);
    v_loaikm VARCHAR(20);
    v_giatri DECIMAL(18,2);
    v_dieukien DECIMAL(18,0);
    v_giamtoida DECIMAL(18,0);
BEGIN
    SELECT COALESCE(SUM(SoLuong * GiaBanTaiThoiDiem), 0)
    INTO v_tongtien
    FROM CTHD
    WHERE MaHD = p_mahd;

    SELECT MaKM
    INTO v_makm
    FROM HOADON
    WHERE MaHD = p_mahd;

    v_tiengiam := 0;

    IF v_makm IS NOT NULL THEN
        SELECT LoaiKM, GiaTri, DieuKienToiThieu, GiaTriGiamToiDa
        INTO v_loaikm, v_giatri, v_dieukien, v_giamtoida
        FROM KHUYENMAI
        WHERE MaKM = v_makm
          AND TrangThai = 1
          AND CURRENT_TIMESTAMP BETWEEN NgayBatDau AND NgayKetThuc;

        IF v_loaikm IS NOT NULL AND v_tongtien >= COALESCE(v_dieukien, 0) THEN
            IF v_loaikm = 'PERCENT' THEN
                v_tiengiam := ROUND(v_tongtien * v_giatri / 100);

                IF v_giamtoida IS NOT NULL THEN
                    v_tiengiam := LEAST(v_tiengiam, v_giamtoida);
                END IF;

            ELSIF v_loaikm = 'AMOUNT' THEN
                v_tiengiam := v_giatri;
            END IF;
        END IF;
    END IF;

    IF v_tiengiam > v_tongtien THEN
        v_tiengiam := v_tongtien;
    END IF;

    v_tongsaugiam := v_tongtien - v_tiengiam;

    UPDATE HOADON
    SET TongTien = v_tongtien,
        TienGiam = v_tiengiam,
        TongTienSauGiam = v_tongsaugiam,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE MaHD = p_mahd;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_trigger_refresh_hoadon_total()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM fn_refresh_hoadon_total(OLD.MaHD);
        RETURN OLD;
    ELSE
        PERFORM fn_refresh_hoadon_total(NEW.MaHD);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cthd_refresh_hoadon_total ON CTHD;
CREATE TRIGGER trg_cthd_refresh_hoadon_total
AFTER INSERT OR UPDATE OR DELETE ON CTHD
FOR EACH ROW
EXECUTE FUNCTION fn_trigger_refresh_hoadon_total();


CREATE OR REPLACE FUNCTION fn_trigger_hoadon_refresh_km()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM fn_refresh_hoadon_total(NEW.MaHD);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hoadon_refresh_km ON HOADON;
CREATE TRIGGER trg_hoadon_refresh_km
AFTER UPDATE OF MaKM ON HOADON
FOR EACH ROW
EXECUTE FUNCTION fn_trigger_hoadon_refresh_km();


/* =========================================================
   11. TỰ CẬP NHẬT HÓA ĐƠN KHI THANH TOÁN THÀNH CÔNG
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_update_hoadon_after_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_paid DECIMAL(18,0);
    v_due DECIMAL(18,0);
BEGIN
    SELECT COALESCE(SUM(SoTien), 0)
    INTO v_paid
    FROM THANHTOAN
    WHERE MaHD = NEW.MaHD
      AND TrangThai = 2;

    SELECT TongTienSauGiam
    INTO v_due
    FROM HOADON
    WHERE MaHD = NEW.MaHD;

    IF v_due IS NOT NULL AND v_due > 0 AND v_paid >= v_due THEN
        UPDATE HOADON
        SET TrangThai = 2,
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE MaHD = NEW.MaHD
          AND TrangThai <> 2;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_thanhtoan_update_hoadon ON THANHTOAN;
CREATE TRIGGER trg_thanhtoan_update_hoadon
AFTER INSERT OR UPDATE ON THANHTOAN
FOR EACH ROW
EXECUTE FUNCTION fn_update_hoadon_after_payment();


/* =========================================================
   12. TỰ CẬP NHẬT SỐ LƯỢNG DÙNG KHUYẾN MÃI
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_update_khuyenmai_usage()
RETURNS TRIGGER AS $$
DECLARE
    v_ok INT;
BEGIN
    IF NEW.TrangThai = 2
       AND OLD.TrangThai <> 2
       AND NEW.MaKM IS NOT NULL THEN

        UPDATE KHUYENMAI
        SET SoLuongDaDung = SoLuongDaDung + 1,
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE MaKM = NEW.MaKM
          AND TrangThai = 1
          AND CURRENT_TIMESTAMP BETWEEN NgayBatDau AND NgayKetThuc
          AND (
              SoLuong IS NULL
              OR SoLuongDaDung < SoLuong
          )
        RETURNING 1 INTO v_ok;

        IF v_ok IS NULL THEN
            RAISE EXCEPTION 'Khuyến mãi % không còn hiệu lực hoặc đã hết lượt dùng', NEW.MaKM;
        END IF;
    END IF;

    IF OLD.TrangThai = 2
       AND NEW.TrangThai <> 2
       AND OLD.MaKM IS NOT NULL THEN

        UPDATE KHUYENMAI
        SET SoLuongDaDung = GREATEST(SoLuongDaDung - 1, 0),
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE MaKM = OLD.MaKM;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hoadon_update_khuyenmai_usage ON HOADON;
CREATE TRIGGER trg_hoadon_update_khuyenmai_usage
AFTER UPDATE OF TrangThai ON HOADON
FOR EACH ROW
EXECUTE FUNCTION fn_update_khuyenmai_usage();


/* =========================================================
   13. XỬ LÝ NHẬP KHO KHI PHIẾU NHẬP ĐƯỢC XÁC NHẬN
   TrangThai = 2: đã nhập kho
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_process_phieunhap()
RETURNS TRIGGER AS $$
DECLARE
    r RECORD;
    v_macn_lo VARCHAR(20);
BEGIN
    IF NEW.TrangThai = 2
       AND COALESCE(NEW.DaXuLyKho, FALSE) = FALSE THEN

        FOR r IN
            SELECT CTPN.MaLo, CTPN.SoLuong, LOHANG.MaCN
            FROM CTPN
            JOIN LOHANG ON LOHANG.MaLo = CTPN.MaLo
            WHERE CTPN.MaPN = NEW.MaPN
        LOOP
            IF r.MaCN <> NEW.MaCN THEN
                RAISE EXCEPTION 'Lô hàng % không thuộc chi nhánh nhập %', r.MaLo, NEW.MaCN;
            END IF;

            PERFORM fn_nhap_kho_lot(
                r.MaLo,
                r.SoLuong,
                'PHIEUNHAP',
                NEW.MaPN,
                1
            );
        END LOOP;

        UPDATE PHIEUNHAP
        SET DaXuLyKho = TRUE,
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE MaPN = NEW.MaPN;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_process_phieunhap ON PHIEUNHAP;
CREATE TRIGGER trg_process_phieunhap
AFTER UPDATE OF TrangThai ON PHIEUNHAP
FOR EACH ROW
EXECUTE FUNCTION fn_process_phieunhap();


/* =========================================================
   14. XỬ LÝ XUẤT KHO KHI PHIẾU XUẤT ĐƯỢC XÁC NHẬN
   TrangThai = 2: đã xuất kho
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_process_phieuxuat()
RETURNS TRIGGER AS $$
DECLARE
    r RECORD;
BEGIN
    IF NEW.TrangThai = 2
       AND COALESCE(NEW.DaXuLyKho, FALSE) = FALSE THEN

        FOR r IN
            SELECT CTPX.MaLo, CTPX.SoLuong, LOHANG.MaCN
            FROM CTPX
            JOIN LOHANG ON LOHANG.MaLo = CTPX.MaLo
            WHERE CTPX.MaPX = NEW.MaPX
        LOOP
            IF r.MaCN <> NEW.MaCN THEN
                RAISE EXCEPTION 'Lô hàng % không thuộc chi nhánh xuất %', r.MaLo, NEW.MaCN;
            END IF;

            PERFORM fn_xuat_kho_lot(
                r.MaLo,
                r.SoLuong,
                'PHIEUXUAT',
                NEW.MaPX,
                2
            );
        END LOOP;

        UPDATE PHIEUXUAT
        SET DaXuLyKho = TRUE,
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE MaPX = NEW.MaPX;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_process_phieuxuat ON PHIEUXUAT;
CREATE TRIGGER trg_process_phieuxuat
AFTER UPDATE OF TrangThai ON PHIEUXUAT
FOR EACH ROW
EXECUTE FUNCTION fn_process_phieuxuat();


/* =========================================================
   15. XỬ LÝ ĐIỀU CHUYỂN KHO
   TrangThai = 3: chi nhánh nhận đã xác nhận
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_process_phieuchuyen()
RETURNS TRIGGER AS $$
DECLARE
    r RECORD;
    v_new_malo VARCHAR(50);
BEGIN
    IF NEW.TrangThai = 3
       AND COALESCE(NEW.DaXuLyKho, FALSE) = FALSE THEN

        FOR r IN
            SELECT
                CTPC.MaLo,
                CTPC.SoLuong,
                LOHANG.MaCN,
                LOHANG.MaNL,
                LOHANG.HSD
            FROM CTPC
            JOIN LOHANG ON LOHANG.MaLo = CTPC.MaLo
            WHERE CTPC.MaPC = NEW.MaPC
        LOOP
            IF r.MaCN <> NEW.MaCN_Xuat THEN
                RAISE EXCEPTION 'Lô hàng % không thuộc chi nhánh xuất %', r.MaLo, NEW.MaCN_Xuat;
            END IF;

            -- Trừ kho chi nhánh xuất
            PERFORM fn_xuat_kho_lot(
                r.MaLo,
                r.SoLuong,
                'PHIEUCHUYEN',
                NEW.MaPC,
                3
            );

            -- Tạo lô mới cho chi nhánh nhận
            v_new_malo := fn_new_id('LO_CHUYEN');

            INSERT INTO LOHANG (
                MaLo,
                MaNL,
                MaCN,
                NgayNhap,
                HSD,
                SoLuongCon,
                IsSynced,
                CreatedAt,
                UpdatedAt
            )
            VALUES (
                v_new_malo,
                r.MaNL,
                NEW.MaCN_Nhap,
                CURRENT_TIMESTAMP,
                r.HSD,
                0,
                FALSE,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            );

            -- Cộng kho chi nhánh nhận
            PERFORM fn_nhap_kho_lot(
                v_new_malo,
                r.SoLuong,
                'PHIEUCHUYEN',
                NEW.MaPC,
                4
            );
        END LOOP;

        UPDATE PHIEUCHUYEN
        SET DaXuLyKho = TRUE,
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE MaPC = NEW.MaPC;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_process_phieuchuyen ON PHIEUCHUYEN;
CREATE TRIGGER trg_process_phieuchuyen
AFTER UPDATE OF TrangThai ON PHIEUCHUYEN
FOR EACH ROW
EXECUTE FUNCTION fn_process_phieuchuyen();


/* =========================================================
   16. XỬ LÝ KIỂM KHO KHI XÁC NHẬN
   TrangThai = 2: đã xác nhận
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_process_kiemkho()
RETURNS TRIGGER AS $$
DECLARE
    r RECORD;
    v_malo VARCHAR(50);
BEGIN
    IF NEW.TrangThai = 2
       AND COALESCE(NEW.DaXuLyKho, FALSE) = FALSE THEN

        FOR r IN
            SELECT MaNL, SoLuongHeThong, SoLuongThucTe, ChenhLech
            FROM CTKK
            WHERE MaKK = NEW.MaKK
        LOOP
            IF r.ChenhLech > 0 THEN
                -- Thừa kho: tạo lô điều chỉnh mới
                v_malo := fn_new_id('LO_ADJ');

                INSERT INTO LOHANG (
                    MaLo,
                    MaNL,
                    MaCN,
                    NgayNhap,
                    HSD,
                    SoLuongCon,
                    IsSynced,
                    CreatedAt,
                    UpdatedAt
                )
                VALUES (
                    v_malo,
                    r.MaNL,
                    NEW.MaCN,
                    CURRENT_TIMESTAMP,
                    NULL,
                    0,
                    FALSE,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                );

                PERFORM fn_nhap_kho_lot(
                    v_malo,
                    r.ChenhLech,
                    'KIEMKHO',
                    NEW.MaKK,
                    5
                );

            ELSIF r.ChenhLech < 0 THEN
                -- Thiếu kho: trừ kho theo FEFO
                PERFORM fn_xuat_kho_fefo(
                    NEW.MaCN,
                    r.MaNL,
                    ABS(r.ChenhLech),
                    'KIEMKHO',
                    NEW.MaKK,
                    5
                );
            END IF;
        END LOOP;

        UPDATE KIEMKHO
        SET DaXuLyKho = TRUE,
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE MaKK = NEW.MaKK;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_process_kiemkho ON KIEMKHO;
CREATE TRIGGER trg_process_kiemkho
AFTER UPDATE OF TrangThai ON KIEMKHO
FOR EACH ROW
EXECUTE FUNCTION fn_process_kiemkho();


/* =========================================================
   17. TỰ TRỪ KHO THEO CÔNG THỨC KHI HÓA ĐƠN THANH TOÁN
   HOADON.TrangThai = 2
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_process_hoadon_tru_kho()
RETURNS TRIGGER AS $$
DECLARE
    r_item RECORD;
    r_dm RECORD;
    v_mapb VARCHAR(50);
    v_soluong_cantru DECIMAL(18,4);
BEGIN
    IF NEW.TrangThai = 2 AND OLD.TrangThai <> 2 THEN

        FOR r_item IN
            SELECT ID, MaSP, SoLuong
            FROM CTHD
            WHERE MaHD = NEW.MaHD
              AND COALESCE(DaTruKho, FALSE) = FALSE
        LOOP
            SELECT MaPB
            INTO v_mapb
            FROM PHIENBANCONGTHUC
            WHERE MaSP = r_item.MaSP
              AND TrangThai = 1
              AND NgayHieuLuc <= NEW.CreatedAt
            ORDER BY NgayHieuLuc DESC
            LIMIT 1;

            IF v_mapb IS NULL THEN
                RAISE EXCEPTION 'Sản phẩm % chưa có công thức hiệu lực, không thể trừ kho',
                    r_item.MaSP;
            END IF;

            FOR r_dm IN
                SELECT MaNL, SoLuong
                FROM DINHMUCCONGTHUC
                WHERE MaPB = v_mapb
            LOOP
                v_soluong_cantru := r_dm.SoLuong * r_item.SoLuong;

                PERFORM fn_xuat_kho_fefo(
                    NEW.MaCN,
                    r_dm.MaNL,
                    v_soluong_cantru,
                    'HOADON',
                    NEW.MaHD,
                    2
                );
            END LOOP;

            UPDATE CTHD
            SET DaTruKho = TRUE,
                UpdatedAt = CURRENT_TIMESTAMP
            WHERE ID = r_item.ID;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hoadon_tru_kho ON HOADON;
CREATE TRIGGER trg_hoadon_tru_kho
AFTER UPDATE OF TrangThai ON HOADON
FOR EACH ROW
EXECUTE FUNCTION fn_process_hoadon_tru_kho();