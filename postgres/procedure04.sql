/* =========================================================
   04_PROCEDURE_FIXED.SQL - POSTGRESQL
   Các stored procedure chính cho POS, kho, kiểm kho, sync.
   ========================================================= */

CREATE OR REPLACE PROCEDURE sp_ap_dung_khuyen_mai(p_mahd VARCHAR, p_makm VARCHAR)
LANGUAGE plpgsql AS $$
DECLARE
    v_trangthai VARCHAR(30);
BEGIN
    SELECT TrangThai INTO v_trangthai FROM HOADON WHERE MaHD = p_mahd;
    IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy hóa đơn %', p_mahd; END IF;
    IF v_trangthai = 'Đã thanh toán' THEN RAISE EXCEPTION 'Hóa đơn đã thanh toán, không thể áp dụng khuyến mãi'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM KHUYENMAI
        WHERE MaKM = p_makm AND TrangThai = 'Hoạt động'
          AND CURRENT_TIMESTAMP BETWEEN NgayBatDau AND NgayKetThuc
          AND (SoLuong IS NULL OR SoLuongDaDung < SoLuong)
    ) THEN
        RAISE EXCEPTION 'Khuyến mãi % không hợp lệ, hết hạn hoặc hết lượt dùng', p_makm;
    END IF;

    UPDATE HOADON SET MaKM = p_makm WHERE MaHD = p_mahd;
    PERFORM fn_refresh_hoadon_total(p_mahd);
END; $$;

CREATE OR REPLACE PROCEDURE sp_bo_khuyen_mai(p_mahd VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM HOADON WHERE MaHD = p_mahd) THEN
        RAISE EXCEPTION 'Không tìm thấy hóa đơn %', p_mahd;
    END IF;
    UPDATE HOADON SET MaKM = NULL WHERE MaHD = p_mahd AND TrangThai <> 'Đã thanh toán';
    PERFORM fn_refresh_hoadon_total(p_mahd);
END; $$;

CREATE OR REPLACE PROCEDURE sp_thanh_toan_hoa_don(
    p_matt VARCHAR,
    p_mahd VARCHAR,
    p_phuongthuc VARCHAR,
    p_sotien NUMERIC,
    p_magiaodichngoai VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
    v_trangthai VARCHAR(30);
BEGIN
    SELECT TrangThai INTO v_trangthai FROM HOADON WHERE MaHD = p_mahd FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy hóa đơn %', p_mahd; END IF;
    IF v_trangthai IN ('Hủy', 'Hoàn tiền') THEN RAISE EXCEPTION 'Không thể thanh toán hóa đơn trạng thái %', v_trangthai; END IF;

    PERFORM fn_refresh_hoadon_total(p_mahd);
    INSERT INTO THANHTOAN(MaTT, MaHD, PhuongThuc, SoTien, TrangThai, MaGiaoDichNgoai)
    VALUES (p_matt, p_mahd, p_phuongthuc, p_sotien, 'Thành công', p_magiaodichngoai);
END; $$;

CREATE OR REPLACE PROCEDURE sp_huy_hoa_don(p_mahd VARCHAR, p_lydo TEXT DEFAULT NULL)
LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM CTHD WHERE MaHD = p_mahd AND DaTruKho = TRUE) THEN
        RAISE EXCEPTION 'Hóa đơn % đã trừ kho. Muốn hủy cần quy trình hoàn kho riêng.', p_mahd;
    END IF;
    UPDATE HOADON SET TrangThai = 'Hủy' WHERE MaHD = p_mahd AND TrangThai <> 'Đã thanh toán';
    IF NOT FOUND THEN RAISE EXCEPTION 'Không thể hủy hóa đơn %, có thể đã thanh toán hoặc không tồn tại', p_mahd; END IF;
END; $$;

CREATE OR REPLACE PROCEDURE sp_xac_nhan_phieu_nhap(p_mapn VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM CTPN WHERE MaPN = p_mapn) THEN
        RAISE EXCEPTION 'Phiếu nhập % chưa có chi tiết', p_mapn;
    END IF;
    UPDATE PHIEUNHAP SET TrangThai = 'Đã nhập kho' WHERE MaPN = p_mapn AND TrangThai = 'Nháp';
    IF NOT FOUND THEN RAISE EXCEPTION 'Không thể xác nhận phiếu nhập %, kiểm tra trạng thái', p_mapn; END IF;
END; $$;

CREATE OR REPLACE PROCEDURE sp_huy_phieu_nhap(p_mapn VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE PHIEUNHAP SET TrangThai = 'Hủy' WHERE MaPN = p_mapn AND TrangThai = 'Nháp';
    IF NOT FOUND THEN RAISE EXCEPTION 'Chỉ hủy được phiếu nhập đang Nháp'; END IF;
END; $$;

CREATE OR REPLACE PROCEDURE sp_xac_nhan_phieu_xuat(p_mapx VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM CTPX WHERE MaPX = p_mapx) THEN
        RAISE EXCEPTION 'Phiếu xuất % chưa có chi tiết', p_mapx;
    END IF;
    UPDATE PHIEUXUAT SET TrangThai = 'Đã xuất kho' WHERE MaPX = p_mapx AND TrangThai = 'Nháp';
    IF NOT FOUND THEN RAISE EXCEPTION 'Không thể xác nhận phiếu xuất %, kiểm tra trạng thái', p_mapx; END IF;
END; $$;

CREATE OR REPLACE PROCEDURE sp_huy_phieu_xuat(p_mapx VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE PHIEUXUAT SET TrangThai = 'Hủy' WHERE MaPX = p_mapx AND TrangThai = 'Nháp';
    IF NOT FOUND THEN RAISE EXCEPTION 'Chỉ hủy được phiếu xuất đang Nháp'; END IF;
END; $$;

CREATE OR REPLACE PROCEDURE sp_gui_phieu_chuyen(p_mapc VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM CTPC WHERE MaPC = p_mapc) THEN
        RAISE EXCEPTION 'Phiếu chuyển % chưa có chi tiết', p_mapc;
    END IF;
    UPDATE PHIEUCHUYEN SET TrangThai = 'Đang chuyển' WHERE MaPC = p_mapc AND TrangThai = 'Tạo phiếu';
    IF NOT FOUND THEN RAISE EXCEPTION 'Không thể gửi phiếu chuyển %, kiểm tra trạng thái', p_mapc; END IF;
END; $$;

CREATE OR REPLACE PROCEDURE sp_xac_nhan_nhan_phieu_chuyen(p_mapc VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE PHIEUCHUYEN SET TrangThai = 'Đã nhận' WHERE MaPC = p_mapc AND TrangThai = 'Đang chuyển';
    IF NOT FOUND THEN RAISE EXCEPTION 'Chỉ xác nhận nhận hàng khi phiếu đang ở trạng thái Đang chuyển'; END IF;
END; $$;

CREATE OR REPLACE PROCEDURE sp_huy_phieu_chuyen(p_mapc VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE PHIEUCHUYEN SET TrangThai = 'Hủy' WHERE MaPC = p_mapc AND TrangThai = 'Tạo phiếu';
    IF NOT FOUND THEN RAISE EXCEPTION 'Chỉ hủy được phiếu chuyển ở trạng thái Tạo phiếu'; END IF;
END; $$;

CREATE OR REPLACE PROCEDURE sp_tinh_chenh_lech_kiem_kho(p_makk VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE CTKK c
    SET SoLuongHeThong = COALESCE((
            SELECT t.SoLuongTon
            FROM KIEMKHO k
            LEFT JOIN TONKHO t ON t.MaCN = k.MaCN AND t.MaNL = c.MaNL
            WHERE k.MaKK = c.MaKK
            LIMIT 1
        ), 0),
        ChenhLech = c.SoLuongThucTe - COALESCE((
            SELECT t.SoLuongTon
            FROM KIEMKHO k
            LEFT JOIN TONKHO t ON t.MaCN = k.MaCN AND t.MaNL = c.MaNL
            WHERE k.MaKK = c.MaKK
            LIMIT 1
        ), 0)
    WHERE c.MaKK = p_makk;
END; $$;

CREATE OR REPLACE PROCEDURE sp_xac_nhan_kiem_kho(p_makk VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    CALL sp_tinh_chenh_lech_kiem_kho(p_makk);
    UPDATE KIEMKHO SET TrangThai = 'Đã xác nhận' WHERE MaKK = p_makk AND TrangThai = 'Đang kiểm';
    IF NOT FOUND THEN RAISE EXCEPTION 'Không thể xác nhận kiểm kho %, kiểm tra trạng thái', p_makk; END IF;
END; $$;

CREATE OR REPLACE PROCEDURE sp_tao_sync_log(p_syncid VARCHAR, p_thucthe VARCHAR, p_recordid VARCHAR, p_clientid VARCHAR DEFAULT NULL, p_ghichu TEXT DEFAULT NULL)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO SYNCLOG(SyncID, ThucThe, RecordID, ClientID, TrangThai, GhiChu)
    VALUES (p_syncid, p_thucthe, p_recordid, p_clientid, 'PENDING', p_ghichu)
    ON CONFLICT (SyncID) DO UPDATE SET TrangThai='PENDING', GhiChu=EXCLUDED.GhiChu, UpdatedAt=CURRENT_TIMESTAMP;
END; $$;

CREATE OR REPLACE PROCEDURE sp_cap_nhat_sync_log(p_syncid VARCHAR, p_trangthai VARCHAR, p_ghichu TEXT DEFAULT NULL)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE SYNCLOG SET TrangThai = p_trangthai, GhiChu = p_ghichu WHERE SyncID = p_syncid;
    IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy sync log %', p_syncid; END IF;
END; $$;

CREATE OR REPLACE PROCEDURE sp_ghi_conflict_log(
    p_conflictid VARCHAR,
    p_thucthe VARCHAR,
    p_recordid VARCHAR,
    p_clientid VARCHAR,
    p_datalocal JSONB,
    p_dataserver JSONB,
    p_ghichu TEXT DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO CONFLICTLOG(ConflictID, ThucThe, RecordID, ClientID, DataLocal, DataServer, TrangThai, GhiChu)
    VALUES (p_conflictid, p_thucthe, p_recordid, p_clientid, p_datalocal, p_dataserver, 'UNRESOLVED', p_ghichu);
    UPDATE SYNCLOG SET TrangThai='CONFLICT', GhiChu=p_ghichu WHERE ThucThe=p_thucthe AND RecordID=p_recordid;
END; $$;
