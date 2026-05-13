/* =========================================================
   JOB SUPPORT FUNCTIONS
   ========================================================= */


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
      AND nl.TrangThai = 1;
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
   TrangThai = 0 nếu đã quá ngày kết thúc.
   ========================================================= */

CREATE OR REPLACE FUNCTION fn_job_mark_expired_promotions()
RETURNS VOID AS $$
BEGIN
    UPDATE KHUYENMAI
    SET TrangThai = 0,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE TrangThai = 1
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



/* =========================================================
   PG_CRON JOBS
   ========================================================= */


/* 1. Refresh báo cáo doanh thu mỗi 5 phút */
SELECT cron.schedule(
    'job_refresh_report_5_minutes',
    '*/5 * * * *',
    $$SELECT fn_job_refresh_report();$$
);


/* 2. Kiểm tra tồn kho thấp mỗi 30 phút */
SELECT cron.schedule(
    'job_check_low_stock_30_minutes',
    '*/30 * * * *',
    $$SELECT fn_job_check_low_stock();$$
);


/* 3. Kiểm tra lô hàng sắp hết hạn mỗi ngày lúc 07:00 */
SELECT cron.schedule(
    'job_check_expiring_lots_daily',
    '0 7 * * *',
    $$SELECT fn_job_check_expiring_lots(7);$$
);


/* 4. Đánh dấu khuyến mãi hết hạn mỗi ngày lúc 00:05 */
SELECT cron.schedule(
    'job_mark_expired_promotions_daily',
    '5 0 * * *',
    $$SELECT fn_job_mark_expired_promotions();$$
);


/* 5. Kiểm tra ca làm chưa đóng mỗi ngày lúc 23:50 */
SELECT cron.schedule(
    'job_check_open_shift_daily',
    '50 23 * * *',
    $$SELECT fn_job_check_open_shift();$$
);


/* 6. Dọn sync log thành công cũ mỗi ngày lúc 02:00 */
SELECT cron.schedule(
    'job_cleanup_sync_log_daily',
    '0 2 * * *',
    $$SELECT fn_job_cleanup_sync_log();$$
);


/* 7. Dọn audit log cũ mỗi tuần lúc 03:00 sáng chủ nhật */
SELECT cron.schedule(
    'job_cleanup_audit_log_weekly',
    '0 3 * * 0',
    $$SELECT fn_job_cleanup_audit_log();$$
);