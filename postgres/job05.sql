/* =========================================================
   JOB SUPPORT FUNCTIONS
   ========================================================= */


/* =========================================================
   0. REFRESH BÁO CÁO DOANH THU & TỒN KHO
   Tạo/cập nhật bảng tổng hợp để dashboard đọc nhanh.
   - BAOCAO_DOANHTHU_CN_NGAY: doanh thu theo chi nhánh/ngày
   - BAOCAO_TONKHO_CN: tồn kho theo chi nhánh/nguyên liệu
   ========================================================= */


CREATE OR REPLACE FUNCTION fn_job_refresh_report()
RETURNS VOID AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS BAOCAO_DOANHTHU_CN_NGAY (
        Ngay DATE NOT NULL,
        MaCN VARCHAR(20) NOT NULL REFERENCES CHINHANH(MaCN),
        SoHoaDon INT NOT NULL DEFAULT 0,
        TongTien NUMERIC(18,0) NOT NULL DEFAULT 0,
        TongGiamGia NUMERIC(18,0) NOT NULL DEFAULT 0,
        DoanhThuThuan NUMERIC(18,0) NOT NULL DEFAULT 0,
        LastRefreshedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (Ngay, MaCN)
    );

    CREATE TABLE IF NOT EXISTS BAOCAO_TONKHO_CN (
        MaCN VARCHAR(20) NOT NULL REFERENCES CHINHANH(MaCN),
        MaNL VARCHAR(50) NOT NULL REFERENCES NGUYENLIEU(MaNL),
        TenNL VARCHAR(150) NOT NULL,
        SoLuongTon NUMERIC(18,2) NOT NULL DEFAULT 0,
        TonToiThieu NUMERIC(18,2) NOT NULL DEFAULT 0,
        CanhBaoTonThap BOOLEAN NOT NULL DEFAULT FALSE,
        LastRefreshedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (MaCN, MaNL)
    );

    TRUNCATE TABLE BAOCAO_DOANHTHU_CN_NGAY;

    INSERT INTO BAOCAO_DOANHTHU_CN_NGAY (
        Ngay,
        MaCN,
        SoHoaDon,
        TongTien,
        TongGiamGia,
        DoanhThuThuan,
        LastRefreshedAt
    )
    SELECT
        hd.CreatedAt::DATE AS Ngay,
        hd.MaCN,
        COUNT(*)::INT AS SoHoaDon,
        COALESCE(SUM(hd.TongTien), 0) AS TongTien,
        COALESCE(SUM(hd.TienGiam), 0) AS TongGiamGia,
        COALESCE(SUM(hd.TongTienSauGiam), 0) AS DoanhThuThuan,
        CURRENT_TIMESTAMP AS LastRefreshedAt
    FROM HOADON hd
    WHERE hd.TrangThai = 'Đã thanh toán'
    GROUP BY hd.CreatedAt::DATE, hd.MaCN;

    TRUNCATE TABLE BAOCAO_TONKHO_CN;

    INSERT INTO BAOCAO_TONKHO_CN (
        MaCN,
        MaNL,
        TenNL,
        SoLuongTon,
        TonToiThieu,
        CanhBaoTonThap,
        LastRefreshedAt
    )
    SELECT
        tk.MaCN,
        tk.MaNL,
        nl.TenNL,
        tk.SoLuongTon,
        nl.TonToiThieu,
        (tk.SoLuongTon < nl.TonToiThieu) AS CanhBaoTonThap,
        CURRENT_TIMESTAMP AS LastRefreshedAt
    FROM TONKHO tk
    JOIN NGUYENLIEU nl ON nl.MaNL = tk.MaNL;
END;
$$ LANGUAGE plpgsql;


/* =========================================================
   1. LOG CẢNH BÁO TỒN KHO THẤP
   Ghi vào AUDITLOG các nguyên liệu dưới tồn tối thiểu.
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_job_check_low_stock()
RETURNS VOID AS $$
BEGIN
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
    SELECT
        fn_new_id('AUDIT'),
        NULL,
        'TONKHO',
        tk.MaCN || '_' || tk.MaNL,
        'UPDATE',
        NULL,
        jsonb_build_object(
            'LoaiCanhBao', 'LOW_STOCK',
            'MaCN', tk.MaCN,
            'MaNL', tk.MaNL,
            'SoLuongTon', tk.SoLuongTon,
            'TonToiThieu', nl.TonToiThieu
        ),
        CURRENT_TIMESTAMP
    FROM TONKHO tk
    JOIN NGUYENLIEU nl ON nl.MaNL = tk.MaNL
    WHERE tk.SoLuongTon < nl.TonToiThieu
      AND nl.TrangThai = 'Hoạt động';
END;
$$ LANGUAGE plpgsql;


/* =========================================================
   2. LOG CẢNH BÁO LÔ HÀNG SẮP HẾT HẠN
   Mặc định cảnh báo trước 7 ngày.
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_job_check_expiring_lots(
    p_days INT DEFAULT 7
)
RETURNS VOID AS $$
BEGIN
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
    SELECT
        fn_new_id('AUDIT'),
        NULL,
        'LOHANG',
        lh.MaLo,
        'UPDATE',
        NULL,
        jsonb_build_object(
            'LoaiCanhBao', 'EXPIRING_LOT',
            'MaLo', lh.MaLo,
            'MaCN', lh.MaCN,
            'MaNL', lh.MaNL,
            'HSD', lh.HSD,
            'SoLuongCon', lh.SoLuongCon
        ),
        CURRENT_TIMESTAMP
    FROM LOHANG lh
    WHERE lh.HSD IS NOT NULL
      AND lh.SoLuongCon > 0
      AND lh.HSD BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days;
END;
$$ LANGUAGE plpgsql;


/* =========================================================
   3. TỰ ĐÁNH DẤU KHUYẾN MÃI HẾT HẠN
   TrangThai = 'Ngưng hoạt động' nếu đã quá ngày kết thúc.
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_job_mark_expired_promotions()
RETURNS VOID AS $$
BEGIN
    UPDATE KHUYENMAI
    SET TrangThai = 'Ngưng hoạt động',
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE TrangThai = 'Hoạt động'
      AND NgayKetThuc < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;


/* =========================================================
   4. KIỂM TRA CA LÀM VIỆC MỞ QUÁ LÂU
   Ghi cảnh báo nếu ca mở quá 12 tiếng chưa đóng.
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_job_check_open_shift()
RETURNS VOID AS $$
BEGIN
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
    SELECT
        fn_new_id('AUDIT'),
        cv.MaNV,
        'CALAMVIEC',
        cv.MaCa,
        'UPDATE',
        NULL,
        jsonb_build_object(
            'LoaiCanhBao', 'SHIFT_OPEN_TOO_LONG',
            'MaCa', cv.MaCa,
            'MaCN', cv.MaCN,
            'MaNV', cv.MaNV,
            'ThoiGianMo', cv.ThoiGianMo
        ),
        CURRENT_TIMESTAMP
    FROM CALAMVIEC cv
    WHERE cv.ThoiGianDong IS NULL
      AND cv.ThoiGianMo < CURRENT_TIMESTAMP - INTERVAL '12 hours';
END;
$$ LANGUAGE plpgsql;


/* =========================================================
   5. DỌN SYNC LOG CŨ
   Xóa log SUCCESS cũ hơn 30 ngày.
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_job_cleanup_sync_log()
RETURNS VOID AS $$
BEGIN
    DELETE FROM SYNCLOG
    WHERE TrangThai = 'SUCCESS'
      AND CreatedAt < CURRENT_TIMESTAMP - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;


/* =========================================================
   6. DỌN AUDIT LOG CŨ
   Xóa log cũ hơn 180 ngày.
   Nếu muốn giữ toàn bộ lịch sử thì không chạy job này.
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_job_cleanup_audit_log()
RETURNS VOID AS $$
BEGIN
    DELETE FROM AUDITLOG
    WHERE CreatedAt < CURRENT_TIMESTAMP - INTERVAL '180 days';
END;
$$ LANGUAGE plpgsql;


