/* =========================================================
   PROCEDURE MODULE - PHUNG LOC COFFEE - POSTGRESQL
   ========================================================= */


/* =========================================================
   1. PROCEDURE ÁP DỤNG KHUYẾN MÃI CHO HÓA ĐƠN
   ========================================================= */

CREATE OR REPLACE PROCEDURE sp_ap_dung_khuyen_mai(
    p_mahd VARCHAR,
    p_makm VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists INT;
    v_trangthai INT;
BEGIN
    SELECT COUNT(*), MAX(TrangThai)
    INTO v_exists, v_trangthai
    FROM HOADON
    WHERE MaHD = p_mahd;

    IF v_exists = 0 THEN
        RAISE EXCEPTION 'Không tìm thấy hóa đơn %', p_mahd;
    END IF;

    IF v_trangthai = 2 THEN
        RAISE EXCEPTION 'Hóa đơn % đã thanh toán, không thể áp dụng khuyến mãi', p_mahd;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM KHUYENMAI
        WHERE MaKM = p_makm
          AND TrangThai = 1
          AND CURRENT_TIMESTAMP BETWEEN NgayBatDau AND NgayKetThuc
          AND (
              SoLuong IS NULL
              OR SoLuongDaDung < SoLuong
          )
    ) THEN
        RAISE EXCEPTION 'Khuyến mãi % không hợp lệ, hết hạn hoặc hết lượt dùng', p_makm;
    END IF;

    UPDATE HOADON
    SET MaKM = p_makm,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE MaHD = p_mahd;

    PERFORM fn_refresh_hoadon_total(p_mahd);
END;
$$;


/* =========================================================
   2. PROCEDURE BỎ KHUYẾN MÃI KHỎI HÓA ĐƠN
   ========================================================= */

CREATE OR REPLACE PROCEDURE sp_bo_khuyen_mai(
    p_mahd VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_trangthai INT;
BEGIN
    SELECT TrangThai
    INTO v_trangthai
    FROM HOADON
    WHERE MaHD = p_mahd;

    IF v_trangthai IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy hóa đơn %', p_mahd;
    END IF;

    IF v_trangthai = 2 THEN
        RAISE EXCEPTION 'Hóa đơn % đã thanh toán, không thể bỏ khuyến mãi', p_mahd;
    END IF;

    UPDATE HOADON
    SET MaKM = NULL,
        TienGiam = 0,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE MaHD = p_mahd;

    PERFORM fn_refresh_hoadon_total(p_mahd);
END;
$$;


/* =========================================================
   3. PROCEDURE THANH TOÁN HÓA ĐƠN
   ========================================================= */

CREATE OR REPLACE PROCEDURE sp_thanh_toan_hoa_don(
    p_mahd VARCHAR,
    p_phuongthuc VARCHAR,
    p_sotien DECIMAL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_mahd VARCHAR(50);
    v_trangthai INT;
    v_tongtien DECIMAL(18,0);
    v_matt VARCHAR(50);
BEGIN
    SELECT MaHD, TrangThai, TongTienSauGiam
    INTO v_mahd, v_trangthai, v_tongtien
    FROM HOADON
    WHERE MaHD = p_mahd
    FOR UPDATE;

    IF v_mahd IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy hóa đơn %', p_mahd;
    END IF;

    IF v_trangthai = 2 THEN
        RAISE EXCEPTION 'Hóa đơn % đã thanh toán', p_mahd;
    END IF;

    IF v_trangthai = 0 THEN
        RAISE EXCEPTION 'Hóa đơn % đã bị hủy', p_mahd;
    END IF;

    PERFORM fn_refresh_hoadon_total(p_mahd);

    SELECT TongTienSauGiam
    INTO v_tongtien
    FROM HOADON
    WHERE MaHD = p_mahd;

    IF p_sotien < v_tongtien THEN
        RAISE EXCEPTION 'Số tiền thanh toán không đủ. Cần %, nhận %', v_tongtien, p_sotien;
    END IF;

    IF p_phuongthuc NOT IN ('CASH', 'CARD', 'MOMO', 'BANKING', 'OTHER') THEN
        RAISE EXCEPTION 'Phương thức thanh toán không hợp lệ: %', p_phuongthuc;
    END IF;

    v_matt := fn_new_id('TT');

    INSERT INTO THANHTOAN (
        MaTT,
        MaHD,
        PhuongThuc,
        SoTien,
        TrangThai,
        IsSynced,
        CreatedAt,
        UpdatedAt
    )
    VALUES (
        v_matt,
        p_mahd,
        p_phuongthuc,
        p_sotien,
        2,
        FALSE,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

    UPDATE HOADON
    SET TrangThai = 2,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE MaHD = p_mahd;

    -- Trigger HOADON sẽ tự:
    -- 1. Cập nhật số lần dùng khuyến mãi
    -- 2. Trừ kho theo công thức
    -- 3. Set CTHD.DaTruKho = TRUE
END;
$$;


/* =========================================================
   4. PROCEDURE HỦY HÓA ĐƠN
   Chỉ cho hủy nếu chưa thanh toán.
   ========================================================= */

CREATE OR REPLACE PROCEDURE sp_huy_hoa_don(
    p_mahd VARCHAR,
    p_lydo TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_trangthai INT;
BEGIN
    SELECT TrangThai
    INTO v_trangthai
    FROM HOADON
    WHERE MaHD = p_mahd
    FOR UPDATE;

    IF v_trangthai IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy hóa đơn %', p_mahd;
    END IF;

    IF v_trangthai = 2 THEN
        RAISE EXCEPTION 'Hóa đơn % đã thanh toán, không thể hủy bằng procedure này', p_mahd;
    END IF;

    UPDATE HOADON
    SET TrangThai = 0,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE MaHD = p_mahd;

    INSERT INTO AUDITLOG (
        LogID,
        MaNV,
        ThucThe,
        RecordID,
        HanhDong,
        DuLieuCu,
        DuLieuMoi,
        CreatedAt
    )
    VALUES (
        fn_new_id('AUDIT'),
        NULL,
        'HOADON',
        p_mahd,
        'UPDATE',
        NULL,
        jsonb_build_object(
            'TrangThai', 0,
            'LyDo', p_lydo
        ),
        CURRENT_TIMESTAMP
    );
END;
$$;


/* =========================================================
   5. PROCEDURE XÁC NHẬN PHIẾU NHẬP
   TrangThai = 2 nghĩa là đã nhập kho.
   ========================================================= */

CREATE OR REPLACE PROCEDURE sp_xac_nhan_phieu_nhap(
    p_mapn VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_trangthai INT;
    v_daxuly BOOLEAN;
BEGIN
    SELECT TrangThai, COALESCE(DaXuLyKho, FALSE)
    INTO v_trangthai, v_daxuly
    FROM PHIEUNHAP
    WHERE MaPN = p_mapn
    FOR UPDATE;

    IF v_trangthai IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy phiếu nhập %', p_mapn;
    END IF;

    IF v_trangthai = 0 THEN
        RAISE EXCEPTION 'Phiếu nhập % đã bị hủy', p_mapn;
    END IF;

    IF v_daxuly = TRUE THEN
        RAISE EXCEPTION 'Phiếu nhập % đã xử lý kho rồi', p_mapn;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM CTPN WHERE MaPN = p_mapn
    ) THEN
        RAISE EXCEPTION 'Phiếu nhập % chưa có chi tiết', p_mapn;
    END IF;

    UPDATE PHIEUNHAP
    SET TrangThai = 2,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE MaPN = p_mapn;

    -- Trigger PHIEUNHAP sẽ tự cộng kho.
END;
$$;


/* =========================================================
   6. PROCEDURE HỦY PHIẾU NHẬP
   Chỉ hủy khi chưa xử lý kho.
   ========================================================= */

CREATE OR REPLACE PROCEDURE sp_huy_phieu_nhap(
    p_mapn VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_daxuly BOOLEAN;
BEGIN
    SELECT COALESCE(DaXuLyKho, FALSE)
    INTO v_daxuly
    FROM PHIEUNHAP
    WHERE MaPN = p_mapn
    FOR UPDATE;

    IF v_daxuly IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy phiếu nhập %', p_mapn;
    END IF;

    IF v_daxuly = TRUE THEN
        RAISE EXCEPTION 'Phiếu nhập % đã xử lý kho, không thể hủy trực tiếp', p_mapn;
    END IF;

    UPDATE PHIEUNHAP
    SET TrangThai = 0,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE MaPN = p_mapn;
END;
$$;


/* =========================================================
   7. PROCEDURE XÁC NHẬN PHIẾU XUẤT
   TrangThai = 2 nghĩa là đã xuất kho.
   ========================================================= */

CREATE OR REPLACE PROCEDURE sp_xac_nhan_phieu_xuat(
    p_mapx VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_trangthai INT;
    v_daxuly BOOLEAN;
BEGIN
    SELECT TrangThai, COALESCE(DaXuLyKho, FALSE)
    INTO v_trangthai, v_daxuly
    FROM PHIEUXUAT
    WHERE MaPX = p_mapx
    FOR UPDATE;

    IF v_trangthai IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy phiếu xuất %', p_mapx;
    END IF;

    IF v_trangthai = 0 THEN
        RAISE EXCEPTION 'Phiếu xuất % đã bị hủy', p_mapx;
    END IF;

    IF v_daxuly = TRUE THEN
        RAISE EXCEPTION 'Phiếu xuất % đã xử lý kho rồi', p_mapx;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM CTPX WHERE MaPX = p_mapx
    ) THEN
        RAISE EXCEPTION 'Phiếu xuất % chưa có chi tiết', p_mapx;
    END IF;

    UPDATE PHIEUXUAT
    SET TrangThai = 2,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE MaPX = p_mapx;

    -- Trigger PHIEUXUAT sẽ tự trừ kho.
END;
$$;


/* =========================================================
   8. PROCEDURE HỦY PHIẾU XUẤT
   Chỉ hủy khi chưa xử lý kho.
   ========================================================= */

CREATE OR REPLACE PROCEDURE sp_huy_phieu_xuat(
    p_mapx VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_daxuly BOOLEAN;
BEGIN
    SELECT COALESCE(DaXuLyKho, FALSE)
    INTO v_daxuly
    FROM PHIEUXUAT
    WHERE MaPX = p_mapx
    FOR UPDATE;

    IF v_daxuly IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy phiếu xuất %', p_mapx;
    END IF;

    IF v_daxuly = TRUE THEN
        RAISE EXCEPTION 'Phiếu xuất % đã xử lý kho, không thể hủy trực tiếp', p_mapx;
    END IF;

    UPDATE PHIEUXUAT
    SET TrangThai = 0,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE MaPX = p_mapx;
END;
$$;


/* =========================================================
   9. PROCEDURE XÁC NHẬN PHIẾU CHUYỂN
   TrangThai = 3 nghĩa là chi nhánh nhận đã nhận hàng.
   ========================================================= */

CREATE OR REPLACE PROCEDURE sp_xac_nhan_phieu_chuyen(
    p_mapc VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_trangthai INT;
    v_daxuly BOOLEAN;
BEGIN
    SELECT TrangThai, COALESCE(DaXuLyKho, FALSE)
    INTO v_trangthai, v_daxuly
    FROM PHIEUCHUYEN
    WHERE MaPC = p_mapc
    FOR UPDATE;

    IF v_trangthai IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy phiếu chuyển %', p_mapc;
    END IF;

    IF v_trangthai = 0 THEN
        RAISE EXCEPTION 'Phiếu chuyển % đã bị hủy', p_mapc;
    END IF;

    IF v_daxuly = TRUE THEN
        RAISE EXCEPTION 'Phiếu chuyển % đã xử lý kho rồi', p_mapc;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM CTPC WHERE MaPC = p_mapc
    ) THEN
        RAISE EXCEPTION 'Phiếu chuyển % chưa có chi tiết', p_mapc;
    END IF;

    UPDATE PHIEUCHUYEN
    SET TrangThai = 3,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE MaPC = p_mapc;

    -- Trigger PHIEUCHUYEN sẽ tự:
    -- 1. Trừ kho chi nhánh xuất
    -- 2. Tạo lô mới cho chi nhánh nhận
    -- 3. Cộng kho chi nhánh nhận
END;
$$;


/* =========================================================
   10. PROCEDURE HỦY PHIẾU CHUYỂN
   Chỉ hủy khi chưa xử lý kho.
   ========================================================= */

CREATE OR REPLACE PROCEDURE sp_huy_phieu_chuyen(
    p_mapc VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_daxuly BOOLEAN;
BEGIN
    SELECT COALESCE(DaXuLyKho, FALSE)
    INTO v_daxuly
    FROM PHIEUCHUYEN
    WHERE MaPC = p_mapc
    FOR UPDATE;

    IF v_daxuly IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy phiếu chuyển %', p_mapc;
    END IF;

    IF v_daxuly = TRUE THEN
        RAISE EXCEPTION 'Phiếu chuyển % đã xử lý kho, không thể hủy trực tiếp', p_mapc;
    END IF;

    UPDATE PHIEUCHUYEN
    SET TrangThai = 0,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE MaPC = p_mapc;
END;
$$;


/* =========================================================
   11. PROCEDURE XÁC NHẬN KIỂM KHO
   TrangThai = 2 nghĩa là đã xác nhận kiểm kho.
   ========================================================= */

CREATE OR REPLACE PROCEDURE sp_xac_nhan_kiem_kho(
    p_makk VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_trangthai INT;
    v_daxuly BOOLEAN;
BEGIN
    SELECT TrangThai, COALESCE(DaXuLyKho, FALSE)
    INTO v_trangthai, v_daxuly
    FROM KIEMKHO
    WHERE MaKK = p_makk
    FOR UPDATE;

    IF v_trangthai IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy phiếu kiểm kho %', p_makk;
    END IF;

    IF v_trangthai = 0 THEN
        RAISE EXCEPTION 'Phiếu kiểm kho % đã bị hủy', p_makk;
    END IF;

    IF v_daxuly = TRUE THEN
        RAISE EXCEPTION 'Phiếu kiểm kho % đã xử lý kho rồi', p_makk;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM CTKK WHERE MaKK = p_makk
    ) THEN
        RAISE EXCEPTION 'Phiếu kiểm kho % chưa có chi tiết', p_makk;
    END IF;

    UPDATE KIEMKHO
    SET TrangThai = 2,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE MaKK = p_makk;

    -- Trigger KIEMKHO sẽ tự điều chỉnh kho.
END;
$$;


/* =========================================================
   12. PROCEDURE TỰ TÍNH CHÊNH LỆCH KIỂM KHO
   Dùng trước khi xác nhận kiểm kho.
   ========================================================= */

CREATE OR REPLACE PROCEDURE sp_tinh_chenh_lech_kiem_kho(
    p_makk VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM KIEMKHO WHERE MaKK = p_makk
    ) THEN
        RAISE EXCEPTION 'Không tìm thấy phiếu kiểm kho %', p_makk;
    END IF;

    UPDATE CTKK
    SET ChenhLech = SoLuongThucTe - SoLuongHeThong,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE MaKK = p_makk;
END;
$$;


/* =========================================================
   13. PROCEDURE TẠO SYNC LOG
   Dùng khi POS offline gửi dữ liệu lên server.
   ========================================================= */

CREATE OR REPLACE PROCEDURE sp_tao_sync_log(
    p_thucthe VARCHAR,
    p_recordid VARCHAR,
    p_trangthai VARCHAR DEFAULT 'PENDING',
    p_ghichu TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_trangthai NOT IN ('PENDING', 'SUCCESS', 'FAILED', 'CONFLICT') THEN
        RAISE EXCEPTION 'Trạng thái sync không hợp lệ: %', p_trangthai;
    END IF;

    INSERT INTO SYNCLOG (
        SyncID,
        ThucThe,
        RecordID,
        TrangThai,
        GhiChu,
        CreatedAt,
        UpdatedAt
    )
    VALUES (
        fn_new_id('SYNC'),
        p_thucthe,
        p_recordid,
        p_trangthai,
        p_ghichu,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
END;
$$;


/* =========================================================
   14. PROCEDURE GHI CONFLICT LOG
   ========================================================= */

CREATE OR REPLACE PROCEDURE sp_ghi_conflict_log(
    p_thucthe VARCHAR,
    p_recordid VARCHAR,
    p_datalocal JSONB,
    p_dataserver JSONB,
    p_ghichu TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO CONFLICTLOG (
        ConflictID,
        ThucThe,
        RecordID,
        DataLocal,
        DataServer,
        TrangThai,
        GhiChu,
        CreatedAt,
        UpdatedAt
    )
    VALUES (
        fn_new_id('CONFLICT'),
        p_thucthe,
        p_recordid,
        p_datalocal,
        p_dataserver,
        'UNRESOLVED',
        p_ghichu,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
END;
$$;