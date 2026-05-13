/* =========================================================
   SAMPLE DATA - PHUNG LOC COFFEE
   PostgreSQL
   ========================================================= */


/* =========================================================
   1. CHI NHÁNH
   ========================================================= */

INSERT INTO CHINHANH (MaCN, TenCN, DiaChi, TrangThai)
VALUES
('CN01', 'Phụng Lộc Coffee - Quận 1', '12 Nguyễn Huệ, Quận 1, TP.HCM', 1),
('CN02', 'Phụng Lộc Coffee - Quận 3', '25 Võ Văn Tần, Quận 3, TP.HCM', 1),
('CN03', 'Phụng Lộc Coffee - Bình Thạnh', '88 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM', 1),
('CN04', 'Phụng Lộc Coffee - Thủ Đức', '45 Võ Văn Ngân, Thủ Đức, TP.HCM', 1),
('CN05', 'Phụng Lộc Coffee - Gò Vấp', '102 Phan Văn Trị, Gò Vấp, TP.HCM', 1),
('CN06', 'Phụng Lộc Coffee - Tân Bình', '70 Cộng Hòa, Tân Bình, TP.HCM', 1),
('CN07', 'Phụng Lộc Coffee - Quận 7', '15 Nguyễn Thị Thập, Quận 7, TP.HCM', 1),
('CN08', 'Phụng Lộc Coffee - Phú Nhuận', '33 Phan Đăng Lưu, Phú Nhuận, TP.HCM', 1)
ON CONFLICT (MaCN) DO NOTHING;


/* =========================================================
   2. ĐƠN VỊ
   ========================================================= */

INSERT INTO DONVI (MaDV, TenDonVi, TrangThai)
VALUES
('GRAM', 'Gram', 1),
('KG', 'Kilogram', 1),
('ML', 'Mililít', 1),
('LIT', 'Lít', 1),
('CAI', 'Cái', 1),
('HOP', 'Hộp', 1),
('CHAI', 'Chai', 1),
('LON', 'Lon', 1),
('GOI', 'Gói', 1)
ON CONFLICT (MaDV) DO NOTHING;


/* =========================================================
   3. NHÀ CUNG CẤP
   ========================================================= */

INSERT INTO NHACUNGCAP (MaNCC, TenNCC, TrangThai)
VALUES
('NCC01', 'Công ty Cà phê Buôn Ma Thuột', 1),
('NCC02', 'Công ty Sữa Việt', 1),
('NCC03', 'Nhà cung cấp Topping Sài Gòn', 1),
('NCC04', 'Công ty Bao bì F&B', 1)
ON CONFLICT (MaNCC) DO NOTHING;


/* =========================================================
   4. NHÂN VIÊN
   ========================================================= */

INSERT INTO NHANVIEN (MaNV, TenNV, ChucVu, MaCN, TrangThai)
VALUES
('NV001', 'Nguyễn Văn An', 'Quản trị hệ thống', NULL, 1),
('NV002', 'Trần Thị Bình', 'Quản lý chi nhánh', 'CN01', 1),
('NV003', 'Lê Văn Cường', 'Thu ngân', 'CN01', 1),
('NV004', 'Phạm Thị Dung', 'Pha chế', 'CN01', 1),
('NV005', 'Hoàng Văn Em', 'Nhân viên kho', 'CN01', 1),
('NV006', 'Đỗ Thị Hoa', 'Quản lý chi nhánh', 'CN02', 1),
('NV007', 'Võ Văn Khang', 'Thu ngân', 'CN02', 1),
('NV008', 'Ngô Thị Lan', 'Kế toán', NULL, 1)
ON CONFLICT (MaNV) DO NOTHING;


/* =========================================================
   5. TÀI KHOẢN
   PasswordHash để mẫu là chuỗi demo.
   Khi làm thật thì dùng BCrypt.
   ========================================================= */

INSERT INTO TAIKHOAN (MaTK, MaNV, Username, PasswordHash, VaiTro, TrangThai)
VALUES
('TK001', 'NV001', 'admin', '1', 'ADMIN', 1),
('TK002', 'NV002', 'manager_cn01', '1', 'QUANLY_CHINHANH', 1),
('TK003', 'NV003', 'cashier_cn01', '1', 'NHANVIEN_BANHANG', 1),
('TK004', 'NV005', 'stock_cn01', '1', 'NHANVIEN_KHO', 1),
('TK005', 'NV008', 'ketoan', '1', 'KETOAN', 1)
ON CONFLICT (MaTK) DO NOTHING;


/* =========================================================
   6. SẢN PHẨM
   ========================================================= */

INSERT INTO SANPHAM (MaSP, TenSP, GiaHienTai, IsTopping, TrangThai)
VALUES
('SP001', 'Cà phê đen đá', 25000, FALSE, 1),
('SP002', 'Cà phê sữa đá', 30000, FALSE, 1),
('SP003', 'Bạc xỉu', 35000, FALSE, 1),
('SP004', 'Trà đào cam sả', 45000, FALSE, 1),
('SP005', 'Trà sữa truyền thống', 40000, FALSE, 1),
('SP006', 'Matcha đá xay', 55000, FALSE, 1),
('SP007', 'Bánh tiramisu', 45000, FALSE, 1),

('SPT01', 'Trân châu đen', 7000, TRUE, 1),
('SPT02', 'Kem cheese', 10000, TRUE, 1),
('SPT03', 'Thạch cà phê', 8000, TRUE, 1)
ON CONFLICT (MaSP) DO NOTHING;


/* =========================================================
   7. KHUYẾN MÃI
   ========================================================= */

INSERT INTO KHUYENMAI (
    MaKM,
    TenKM,
    LoaiKM,
    GiaTri,
    DieuKienToiThieu,
    GiaTriGiamToiDa,
    NgayBatDau,
    NgayKetThuc,
    SoLuong,
    SoLuongDaDung,
    TrangThai
)
VALUES
('KM001', 'Giảm 10% khai trương chi nhánh', 'PERCENT', 10, 50000, 30000, '2026-05-01 00:00:00', '2026-06-30 23:59:59', 500, 0, 1),
('KM002', 'Giảm 20.000 cho hóa đơn từ 100.000', 'AMOUNT', 20000, 100000, NULL, '2026-05-01 00:00:00', '2026-12-31 23:59:59', 1000, 0, 1),
('KM003', 'Giảm 15% cuối tuần', 'PERCENT', 15, 80000, 40000, '2026-05-01 00:00:00', '2026-12-31 23:59:59', NULL, 0, 1)
ON CONFLICT (MaKM) DO NOTHING;


/* =========================================================
   8. NGUYÊN LIỆU
   ========================================================= */

INSERT INTO NGUYENLIEU (MaNL, TenNL, DonViCoBan, TonToiThieu, TrangThai)
VALUES
('NL001', 'Cà phê bột', 'GRAM', 5000, 1),
('NL002', 'Sữa đặc', 'ML', 3000, 1),
('NL003', 'Sữa tươi', 'ML', 5000, 1),
('NL004', 'Đường', 'GRAM', 3000, 1),
('NL005', 'Đá viên', 'GRAM', 10000, 1),
('NL006', 'Trà đào', 'ML', 3000, 1),
('NL007', 'Cam tươi', 'GRAM', 2000, 1),
('NL008', 'Sả', 'GRAM', 500, 1),
('NL009', 'Bột matcha', 'GRAM', 1000, 1),
('NL010', 'Trân châu đen', 'GRAM', 2000, 1),
('NL011', 'Kem cheese', 'GRAM', 1000, 1),
('NL012', 'Ly nhựa', 'CAI', 500, 1),
('NL013', 'Ống hút', 'CAI', 500, 1)
ON CONFLICT (MaNL) DO NOTHING;


/* =========================================================
   9. NGUYÊN LIỆU - ĐƠN VỊ
   ========================================================= */

INSERT INTO NGUYENLIEU_DONVI (MaNL, MaDV)
VALUES
('NL001', 'GRAM'), ('NL001', 'KG'),
('NL002', 'ML'), ('NL002', 'LIT'),
('NL003', 'ML'), ('NL003', 'LIT'),
('NL004', 'GRAM'), ('NL004', 'KG'),
('NL005', 'GRAM'), ('NL005', 'KG'),
('NL006', 'ML'), ('NL006', 'LIT'),
('NL007', 'GRAM'), ('NL007', 'KG'),
('NL008', 'GRAM'), ('NL008', 'KG'),
('NL009', 'GRAM'), ('NL009', 'KG'),
('NL010', 'GRAM'), ('NL010', 'KG'),
('NL011', 'GRAM'), ('NL011', 'KG'),
('NL012', 'CAI'),
('NL013', 'CAI')
ON CONFLICT (MaNL, MaDV) DO NOTHING;


/* =========================================================
   10. QUY ĐỔI ĐƠN VỊ
   ========================================================= */

INSERT INTO QUYDOIDONVI (MaDV_From, MaDV_To, TyLeQuyDoi, TrangThai)
VALUES
('KG', 'GRAM', 1000, 1),
('LIT', 'ML', 1000, 1),
('HOP', 'CAI', 12, 1),
('GOI', 'CAI', 50, 1)
ON CONFLICT (MaDV_From, MaDV_To) DO NOTHING;


/* =========================================================
   11. PHIÊN BẢN CÔNG THỨC
   ========================================================= */

INSERT INTO PHIENBANCONGTHUC (MaPB, MaSP, NgayHieuLuc, TrangThai)
VALUES
('PB001', 'SP001', '2026-01-01 00:00:00', 1),
('PB002', 'SP002', '2026-01-01 00:00:00', 1),
('PB003', 'SP003', '2026-01-01 00:00:00', 1),
('PB004', 'SP004', '2026-01-01 00:00:00', 1),
('PB005', 'SP005', '2026-01-01 00:00:00', 1),
('PB006', 'SP006', '2026-01-01 00:00:00', 1),
('PB_T01', 'SPT01', '2026-01-01 00:00:00', 1),
('PB_T02', 'SPT02', '2026-01-01 00:00:00', 1),
('PB_T03', 'SPT03', '2026-01-01 00:00:00', 1)
ON CONFLICT (MaPB) DO NOTHING;


/* =========================================================
   12. ĐỊNH MỨC CÔNG THỨC
   Số lượng tính theo đơn vị cơ bản của nguyên liệu.
   Ví dụ cà phê bột là GRAM, sữa đặc là ML.
   ========================================================= */

INSERT INTO DINHMUCCONGTHUC (MaPB, MaNL, SoLuong)
VALUES
-- Cà phê đen đá
('PB001', 'NL001', 20),
('PB001', 'NL004', 10),
('PB001', 'NL005', 150),
('PB001', 'NL012', 1),
('PB001', 'NL013', 1),

-- Cà phê sữa đá
('PB002', 'NL001', 20),
('PB002', 'NL002', 30),
('PB002', 'NL005', 150),
('PB002', 'NL012', 1),
('PB002', 'NL013', 1),

-- Bạc xỉu
('PB003', 'NL001', 10),
('PB003', 'NL002', 35),
('PB003', 'NL003', 100),
('PB003', 'NL005', 150),
('PB003', 'NL012', 1),
('PB003', 'NL013', 1),

-- Trà đào cam sả
('PB004', 'NL006', 120),
('PB004', 'NL007', 50),
('PB004', 'NL008', 5),
('PB004', 'NL004', 15),
('PB004', 'NL005', 150),
('PB004', 'NL012', 1),
('PB004', 'NL013', 1),

-- Trà sữa truyền thống
('PB005', 'NL003', 150),
('PB005', 'NL004', 20),
('PB005', 'NL005', 150),
('PB005', 'NL012', 1),
('PB005', 'NL013', 1),

-- Matcha đá xay
('PB006', 'NL009', 15),
('PB006', 'NL003', 180),
('PB006', 'NL004', 20),
('PB006', 'NL005', 200),
('PB006', 'NL012', 1),
('PB006', 'NL013', 1),

-- Topping trân châu
('PB_T01', 'NL010', 30),

-- Topping kem cheese
('PB_T02', 'NL011', 25),

-- Topping thạch cà phê
('PB_T03', 'NL001', 5),
('PB_T03', 'NL004', 10)
ON CONFLICT (MaPB, MaNL) DO NOTHING;


/* =========================================================
   13. LÔ HÀNG
   Lưu ý:
   Nếu bạn dùng trigger nhập kho, nên để SoLuongCon = 0.
   Sau đó tạo CTPN rồi CALL sp_xac_nhan_phieu_nhap.
   ========================================================= */

INSERT INTO LOHANG (MaLo, MaNL, MaCN, NgayNhap, HSD, SoLuongCon, IsSynced)
VALUES
('LO001', 'NL001', 'CN01', '2026-05-01 08:00:00', '2026-12-31', 0, FALSE),
('LO002', 'NL002', 'CN01', '2026-05-01 08:00:00', '2026-09-30', 0, FALSE),
('LO003', 'NL003', 'CN01', '2026-05-01 08:00:00', '2026-06-15', 0, FALSE),
('LO004', 'NL004', 'CN01', '2026-05-01 08:00:00', '2027-01-01', 0, FALSE),
('LO005', 'NL005', 'CN01', '2026-05-01 08:00:00', NULL, 0, FALSE),
('LO006', 'NL006', 'CN01', '2026-05-01 08:00:00', '2026-10-01', 0, FALSE),
('LO007', 'NL007', 'CN01', '2026-05-01 08:00:00', '2026-05-20', 0, FALSE),
('LO008', 'NL008', 'CN01', '2026-05-01 08:00:00', '2026-05-25', 0, FALSE),
('LO009', 'NL009', 'CN01', '2026-05-01 08:00:00', '2026-12-31', 0, FALSE),
('LO010', 'NL010', 'CN01', '2026-05-01 08:00:00', '2026-08-31', 0, FALSE),
('LO011', 'NL011', 'CN01', '2026-05-01 08:00:00', '2026-07-31', 0, FALSE),
('LO012', 'NL012', 'CN01', '2026-05-01 08:00:00', NULL, 0, FALSE),
('LO013', 'NL013', 'CN01', '2026-05-01 08:00:00', NULL, 0, FALSE)
ON CONFLICT (MaLo) DO NOTHING;


/* =========================================================
   14. PHIẾU NHẬP + CHI TIẾT PHIẾU NHẬP
   Sau khi insert xong, gọi procedure xác nhận phiếu nhập.
   ========================================================= */

INSERT INTO PHIEUNHAP (
    MaPN, MaCN, MaNV, MaNCC, TongTien, NgayNhap, TrangThai, IsSynced
)
VALUES
('PN001', 'CN01', 'NV005', 'NCC01', 15000000, '2026-05-01 08:30:00', 1, FALSE)
ON CONFLICT (MaPN) DO NOTHING;


INSERT INTO CTPN (MaPN, MaLo, SoLuong, DonGiaNhap, ThanhTien)
VALUES
('PN001', 'LO001', 20000, 300, 6000000),
('PN001', 'LO002', 10000, 200, 2000000),
('PN001', 'LO003', 20000, 250, 5000000),
('PN001', 'LO004', 10000, 50, 500000),
('PN001', 'LO005', 50000, 10, 500000),
('PN001', 'LO006', 10000, 100, 1000000),
('PN001', 'LO007', 5000, 80, 400000),
('PN001', 'LO008', 1000, 50, 50000),
('PN001', 'LO009', 3000, 500, 1500000),
('PN001', 'LO010', 8000, 120, 960000),
('PN001', 'LO011', 5000, 150, 750000),
('PN001', 'LO012', 2000, 500, 1000000),
('PN001', 'LO013', 2000, 200, 400000)
ON CONFLICT (MaPN, MaLo) DO NOTHING;


/* Nếu đã có procedure + trigger nhập kho thì chạy dòng này.
   Nó sẽ tự cộng LOHANG.SoLuongCon và TONKHO. */

CALL sp_xac_nhan_phieu_nhap('PN001');


/* =========================================================
   15. CA LÀM VIỆC
   ========================================================= */

INSERT INTO CALAMVIEC (
    MaCa,
    MaNV,
    MaCN,
    ThoiGianMo,
    ThoiGianDong,
    TienDauCa,
    TienCuoiCa,
    SoTienThatThoat,
    IsSynced
)
VALUES
('CA001', 'NV003', 'CN01', '2026-05-13 07:00:00', NULL, 1000000, 0, 0, FALSE)
ON CONFLICT (MaCa) DO NOTHING;


/* =========================================================
   16. HÓA ĐƠN MẪU CHƯA THANH TOÁN
   Trigger sẽ tự tính tổng tiền khi thêm CTHD.
   ========================================================= */

INSERT INTO HOADON (
    MaHD,
    MaCa,
    MaCN,
    MaKM,
    TongTien,
    TienGiam,
    TongTienSauGiam,
    TrangThai,
    IsSynced
)
VALUES
('HD001', 'CA001', 'CN01', NULL, 0, 0, 0, 1, FALSE)
ON CONFLICT (MaHD) DO NOTHING;


INSERT INTO CTHD (
    ID,
    MaHD,
    MaSP,
    IDMonChinh,
    SoLuong,
    GiaBanTaiThoiDiem,
    GhiChu,
    DaTruKho
)
VALUES
('CTHD001', 'HD001', 'SP002', NULL, 2, 30000, 'Ít đá', FALSE),
('CTHD002', 'HD001', 'SP004', NULL, 1, 45000, NULL, FALSE),
('CTHD003', 'HD001', 'SPT01', 'CTHD002', 1, 7000, 'Topping cho trà đào', FALSE)
ON CONFLICT (ID) DO NOTHING;


/* Áp dụng khuyến mãi */
CALL sp_ap_dung_khuyen_mai('HD001', 'KM001');


/* Thanh toán hóa đơn.
   Procedure sẽ insert THANHTOAN.
   Trigger sẽ đổi trạng thái hóa đơn, trừ kho theo công thức.
*/
CALL sp_thanh_toan_hoa_don('HD001', 'CASH', 100000);


/* =========================================================
   17. HÓA ĐƠN MẪU 2
   ========================================================= */

INSERT INTO HOADON (
    MaHD,
    MaCa,
    MaCN,
    MaKM,
    TongTien,
    TienGiam,
    TongTienSauGiam,
    TrangThai,
    IsSynced
)
VALUES
('HD002', 'CA001', 'CN01', NULL, 0, 0, 0, 1, FALSE)
ON CONFLICT (MaHD) DO NOTHING;


INSERT INTO CTHD (
    ID,
    MaHD,
    MaSP,
    IDMonChinh,
    SoLuong,
    GiaBanTaiThoiDiem,
    GhiChu,
    DaTruKho
)
VALUES
('CTHD004', 'HD002', 'SP001', NULL, 1, 25000, NULL, FALSE),
('CTHD005', 'HD002', 'SP003', NULL, 1, 35000, NULL, FALSE),
('CTHD006', 'HD002', 'SPT02', 'CTHD005', 1, 10000, 'Kem cheese cho bạc xỉu', FALSE)
ON CONFLICT (ID) DO NOTHING;

CALL sp_thanh_toan_hoa_don('HD002', 'BANKING', 70000);


/* =========================================================
   18. PHIẾU XUẤT MẪU
   Xuất hủy nguyên liệu hỏng.
   ========================================================= */

INSERT INTO PHIEUXUAT (
    MaPX,
    MaCN,
    MaNV,
    LyDo,
    TrangThai,
    IsSynced
)
VALUES
('PX001', 'CN01', 'NV005', 'Hủy nguyên liệu hỏng trong ca', 1, FALSE)
ON CONFLICT (MaPX) DO NOTHING;


INSERT INTO CTPX (MaPX, MaLo, SoLuong)
VALUES
('PX001', 'LO007', 200),
('PX001', 'LO008', 50)
ON CONFLICT (MaPX, MaLo) DO NOTHING;


CALL sp_xac_nhan_phieu_xuat('PX001');


/* =========================================================
   19. KIỂM KHO MẪU
   ========================================================= */

INSERT INTO KIEMKHO (
    MaKK,
    MaNV,
    MaCN,
    NgayKiem,
    TrangThai,
    IsSynced
)
VALUES
('KK001', 'NV005', 'CN01', '2026-05-13 22:00:00', 1, FALSE)
ON CONFLICT (MaKK) DO NOTHING;


INSERT INTO CTKK (
    MaKK,
    MaNL,
    SoLuongHeThong,
    SoLuongThucTe,
    ChenhLech
)
SELECT
    'KK001',
    tk.MaNL,
    tk.SoLuongTon,
    tk.SoLuongTon,
    0
FROM TONKHO tk
WHERE tk.MaCN = 'CN01'
ON CONFLICT (MaKK, MaNL) DO NOTHING;


/* Ví dụ chỉnh thực tế thấp hơn hệ thống cho cà phê bột */
UPDATE CTKK
SET SoLuongThucTe = SoLuongHeThong - 100,
    ChenhLech = -100,
    UpdatedAt = CURRENT_TIMESTAMP
WHERE MaKK = 'KK001'
  AND MaNL = 'NL001';


CALL sp_xac_nhan_kiem_kho('KK001');


/* =========================================================
   20. PHIẾU CHUYỂN MẪU
   Chuyển nguyên liệu từ CN01 sang CN02.
   ========================================================= */

INSERT INTO PHIEUCHUYEN (
    MaPC,
    MaCN_Xuat,
    MaCN_Nhap,
    MaNV,
    TrangThai,
    IsSynced
)
VALUES
('PC001', 'CN01', 'CN02', 'NV005', 1, FALSE)
ON CONFLICT (MaPC) DO NOTHING;


INSERT INTO CTPC (MaPC, MaLo, SoLuong)
VALUES
('PC001', 'LO001', 1000),
('PC001', 'LO002', 500),
('PC001', 'LO012', 100)
ON CONFLICT (MaPC, MaLo) DO NOTHING;


CALL sp_xac_nhan_phieu_chuyen('PC001');


/* =========================================================
   21. SYNC LOG / CONFLICT LOG MẪU
   ========================================================= */

CALL sp_tao_sync_log(
    'HOADON',
    'HD001',
    'SUCCESS',
    'Hóa đơn HD001 đã đồng bộ thành công từ POS CN01'
);

CALL sp_ghi_conflict_log(
    'HOADON',
    'HD_DEMO_CONFLICT',
    '{"MaHD":"HD_DEMO_CONFLICT","TongTien":90000,"UpdatedAt":"2026-05-13T10:00:00"}'::jsonb,
    '{"MaHD":"HD_DEMO_CONFLICT","TongTien":85000,"UpdatedAt":"2026-05-13T09:58:00"}'::jsonb,
    'Xung đột dữ liệu hóa đơn khi POS offline đồng bộ lại'
);