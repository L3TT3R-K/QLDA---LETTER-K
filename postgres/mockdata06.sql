/* =========================================================
   06_MOCKDATA_FIXED.SQL - POSTGRESQL
   Dữ liệu mẫu cho 8 chi nhánh, POS, kho, recipe.
   PasswordHash demo = bcrypt của chuỗi "123456" dùng cho BCrypt.
   ========================================================= */

BEGIN;

INSERT INTO CHINHANH (MaCN, TenCN, DiaChi, TrangThai) VALUES
('CN01','Phụng Lộc Coffee - Quận 1','12 Nguyễn Huệ, Quận 1, TP.HCM','Hoạt động'),
('CN02','Phụng Lộc Coffee - Quận 3','25 Võ Văn Tần, Quận 3, TP.HCM','Hoạt động'),
('CN03','Phụng Lộc Coffee - Bình Thạnh','88 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM','Hoạt động'),
('CN04','Phụng Lộc Coffee - Thủ Đức','45 Võ Văn Ngân, Thủ Đức, TP.HCM','Hoạt động'),
('CN05','Phụng Lộc Coffee - Gò Vấp','102 Phan Văn Trị, Gò Vấp, TP.HCM','Hoạt động'),
('CN06','Phụng Lộc Coffee - Tân Bình','70 Cộng Hòa, Tân Bình, TP.HCM','Hoạt động'),
('CN07','Phụng Lộc Coffee - Quận 7','15 Nguyễn Thị Thập, Quận 7, TP.HCM','Hoạt động'),
('CN08','Phụng Lộc Coffee - Phú Nhuận','33 Phan Đăng Lưu, Phú Nhuận, TP.HCM','Hoạt động')
ON CONFLICT DO NOTHING;

INSERT INTO DONVI (MaDV, TenDonVi) VALUES
('GRAM','Gram'),('KG','Kilogram'),('ML','Mililít'),('LIT','Lít'),('CAI','Cái'),('HOP','Hộp'),('CHAI','Chai'),('LON','Lon'),('GOI','Gói')
ON CONFLICT DO NOTHING;

INSERT INTO NHACUNGCAP (MaNCC, TenNCC, SDT, DiaChi) VALUES
('NCC01','Công ty Cà phê Buôn Ma Thuột','0901000001','Đắk Lắk'),
('NCC02','Công ty Sữa Việt','0901000002','TP.HCM'),
('NCC03','Nhà cung cấp Topping Sài Gòn','0901000003','TP.HCM'),
('NCC04','Công ty Bao bì F&B','0901000004','Bình Dương')
ON CONFLICT DO NOTHING;

INSERT INTO NHANVIEN (MaNV, TenNV, SDT, ChucVu, MaCN) VALUES
('NV001','Nguyễn Văn An','0902000001','Quản trị hệ thống',NULL),
('NV002','Trần Thị Bình','0902000002','Quản lý chi nhánh','CN01'),
('NV003','Lê Văn Cường','0902000003','Thu ngân','CN01'),
('NV004','Phạm Thị Dung','0902000004','Pha chế','CN01'),
('NV005','Hoàng Văn Em','0902000005','Nhân viên kho','CN01'),
('NV006','Đỗ Thị Hoa','0902000006','Quản lý chi nhánh','CN02'),
('NV007','Võ Văn Khang','0902000007','Thu ngân','CN02'),
('NV008','Ngô Thị Lan','0902000008','Kế toán',NULL)
ON CONFLICT DO NOTHING;

INSERT INTO TAIKHOAN (MaTK, MaNV, Username, PasswordHash, VaiTro) VALUES
('TK001','NV001','admin','$2a$10$DowJonesDemoHashFor123456xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx','ADMIN'),
('TK002','NV002','manager_cn01','$2a$10$DowJonesDemoHashFor123456xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx','QUANLY_CHINHANH'),
('TK003','NV003','cashier_cn01','$2a$10$DowJonesDemoHashFor123456xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx','NHANVIEN_BANHANG'),
('TK004','NV005','stock_cn01','$2a$10$DowJonesDemoHashFor123456xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx','NHANVIEN_KHO'),
('TK005','NV008','ketoan','$2a$10$DowJonesDemoHashFor123456xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx','KETOAN')
ON CONFLICT DO NOTHING;

INSERT INTO SANPHAM (MaSP, TenSP, GiaHienTai, IsTopping) VALUES
('SP001','Cà phê đen đá',25000,FALSE),
('SP002','Cà phê sữa đá',30000,FALSE),
('SP003','Bạc xỉu',35000,FALSE),
('SP004','Trà đào cam sả',45000,FALSE),
('SP005','Trà sữa truyền thống',40000,FALSE),
('SP006','Matcha đá xay',55000,FALSE),
('SP007','Bánh tiramisu',45000,FALSE),
('SPT01','Trân châu đen',7000,TRUE),
('SPT02','Kem cheese',10000,TRUE),
('SPT03','Thạch cà phê',8000,TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO KHUYENMAI (MaKM, TenKM, LoaiKM, GiaTri, DieuKienToiThieu, GiaTriGiamToiDa, NgayBatDau, NgayKetThuc, SoLuong) VALUES
('KM001','Giảm 10% khai trương chi nhánh','PERCENT',10,50000,30000,'2026-05-01 00:00:00','2026-06-30 23:59:59',500),
('KM002','Giảm 20.000 cho hóa đơn từ 100.000','AMOUNT',20000,100000,NULL,'2026-05-01 00:00:00','2026-12-31 23:59:59',1000),
('KM003','Giảm 15% cuối tuần','PERCENT',15,80000,40000,'2026-05-01 00:00:00','2026-12-31 23:59:59',NULL)
ON CONFLICT DO NOTHING;

INSERT INTO NGUYENLIEU (MaNL, TenNL, DonViCoBan, TonToiThieu) VALUES
('NL001','Cà phê bột','GRAM',5000),('NL002','Sữa đặc','ML',3000),('NL003','Sữa tươi','ML',5000),
('NL004','Đường','GRAM',3000),('NL005','Đá viên','GRAM',10000),('NL006','Trà đào','ML',3000),
('NL007','Cam tươi','GRAM',2000),('NL008','Sả','GRAM',500),('NL009','Bột matcha','GRAM',1000),
('NL010','Trân châu đen','GRAM',2000),('NL011','Kem cheese','GRAM',1000),('NL012','Ly nhựa','CAI',500),('NL013','Ống hút','CAI',500)
ON CONFLICT DO NOTHING;

INSERT INTO NGUYENLIEU_DONVI (MaNL, MaDV) VALUES
('NL001','GRAM'),('NL001','KG'),('NL002','ML'),('NL002','LIT'),('NL003','ML'),('NL003','LIT'),
('NL004','GRAM'),('NL004','KG'),('NL005','GRAM'),('NL005','KG'),('NL006','ML'),('NL006','LIT'),
('NL007','GRAM'),('NL007','KG'),('NL008','GRAM'),('NL008','KG'),('NL009','GRAM'),('NL009','KG'),
('NL010','GRAM'),('NL010','KG'),('NL011','GRAM'),('NL011','KG'),('NL012','CAI'),('NL013','CAI')
ON CONFLICT DO NOTHING;

INSERT INTO QUYDOIDONVI (MaDV_From, MaDV_To, TyLeQuyDoi) VALUES
('KG','GRAM',1000),('LIT','ML',1000),('HOP','CAI',12),('GOI','CAI',50)
ON CONFLICT DO NOTHING;

INSERT INTO PHIENBANCONGTHUC (MaPB, MaSP, NgayHieuLuc) VALUES
('PB001','SP001','2026-01-01'),('PB002','SP002','2026-01-01'),('PB003','SP003','2026-01-01'),
('PB004','SP004','2026-01-01'),('PB005','SP005','2026-01-01'),('PB006','SP006','2026-01-01'),
('PB_T01','SPT01','2026-01-01'),('PB_T02','SPT02','2026-01-01'),('PB_T03','SPT03','2026-01-01')
ON CONFLICT DO NOTHING;

INSERT INTO DINHMUCCONGTHUC (MaPB, MaNL, SoLuong) VALUES
('PB001','NL001',20),('PB001','NL004',10),('PB001','NL005',150),('PB001','NL012',1),('PB001','NL013',1),
('PB002','NL001',20),('PB002','NL002',30),('PB002','NL005',150),('PB002','NL012',1),('PB002','NL013',1),
('PB003','NL001',10),('PB003','NL002',35),('PB003','NL003',100),('PB003','NL005',150),('PB003','NL012',1),('PB003','NL013',1),
('PB004','NL006',120),('PB004','NL007',50),('PB004','NL008',5),('PB004','NL004',15),('PB004','NL005',150),('PB004','NL012',1),('PB004','NL013',1),
('PB005','NL003',150),('PB005','NL004',20),('PB005','NL005',150),('PB005','NL012',1),('PB005','NL013',1),
('PB006','NL009',15),('PB006','NL003',180),('PB006','NL004',20),('PB006','NL005',200),('PB006','NL012',1),('PB006','NL013',1),
('PB_T01','NL010',50),('PB_T02','NL011',40),('PB_T03','NL001',5),('PB_T03','NL004',10)
ON CONFLICT DO NOTHING;

-- Lô hàng ban đầu cho CN01 và CN02
INSERT INTO LOHANG (MaLo, MaNL, MaCN, NgayNhap, HSD, SoLuongCon) VALUES
('LO_CN01_NL001_001','NL001','CN01','2026-05-01','2026-12-31',20000),
('LO_CN01_NL002_001','NL002','CN01','2026-05-01','2026-08-31',12000),
('LO_CN01_NL003_001','NL003','CN01','2026-05-01','2026-06-20',18000),
('LO_CN01_NL004_001','NL004','CN01','2026-05-01','2027-05-01',20000),
('LO_CN01_NL005_001','NL005','CN01','2026-05-01','2026-05-20',80000),
('LO_CN01_NL006_001','NL006','CN01','2026-05-01','2026-09-30',15000),
('LO_CN01_NL007_001','NL007','CN01','2026-05-12','2026-05-18',8000),
('LO_CN01_NL008_001','NL008','CN01','2026-05-12','2026-05-25',2000),
('LO_CN01_NL009_001','NL009','CN01','2026-05-01','2026-12-31',5000),
('LO_CN01_NL010_001','NL010','CN01','2026-05-01','2026-08-31',10000),
('LO_CN01_NL011_001','NL011','CN01','2026-05-01','2026-06-30',5000),
('LO_CN01_NL012_001','NL012','CN01','2026-05-01',NULL,2000),
('LO_CN01_NL013_001','NL013','CN01','2026-05-01',NULL,2000),
('LO_CN02_NL001_001','NL001','CN02','2026-05-01','2026-12-31',15000),
('LO_CN02_NL002_001','NL002','CN02','2026-05-01','2026-08-31',9000),
('LO_CN02_NL003_001','NL003','CN02','2026-05-01','2026-06-20',12000),
('LO_CN02_NL004_001','NL004','CN02','2026-05-01','2027-05-01',15000),
('LO_CN02_NL005_001','NL005','CN02','2026-05-01','2026-05-20',60000),
('LO_CN02_NL012_001','NL012','CN02','2026-05-01',NULL,1500),
('LO_CN02_NL013_001','NL013','CN02','2026-05-01',NULL,1500)
ON CONFLICT DO NOTHING;

INSERT INTO TONKHO (MaCN, MaNL, SoLuongTon)
SELECT MaCN, MaNL, SUM(SoLuongCon) FROM LOHANG GROUP BY MaCN, MaNL
ON CONFLICT (MaCN, MaNL) DO UPDATE SET SoLuongTon = EXCLUDED.SoLuongTon;

INSERT INTO CALAMVIEC (MaCa, MaNV, MaCN, ThoiGianMo, TienDauCa) VALUES
('CA001','NV003','CN01','2026-05-13 07:00:00',1000000),
('CA002','NV007','CN02','2026-05-13 07:00:00',800000)
ON CONFLICT DO NOTHING;

INSERT INTO HOADON (MaHD, MaCa, MaCN, MaKM, TrangThai) VALUES
('HD001','CA001','CN01','KM001','Tạm'),
('HD002','CA002','CN02',NULL,'Tạm')
ON CONFLICT DO NOTHING;

INSERT INTO CTHD (ID, MaHD, MaSP, SoLuong, GiaBanTaiThoiDiem) VALUES
('CTHD001','HD001','SP002',2,30000),
('CTHD002','HD001','SPT01',2,7000),
('CTHD003','HD002','SP001',1,25000),
('CTHD004','HD002','SP004',1,45000)
ON CONFLICT DO NOTHING;

-- Cập nhật tổng tiền hóa đơn mẫu
SELECT fn_refresh_hoadon_total('HD001');
SELECT fn_refresh_hoadon_total('HD002');

-- Phiếu nhập mẫu ở trạng thái Nháp để test CALL sp_xac_nhan_phieu_nhap('PN001')
INSERT INTO LOHANG (MaLo, MaNL, MaCN, NgayNhap, HSD, SoLuongCon) VALUES
('LO_CN01_NL001_002','NL001','CN01','2026-05-13','2026-12-31',0)
ON CONFLICT DO NOTHING;
INSERT INTO PHIEUNHAP (MaPN, MaCN, MaNV, MaNCC, TongTien, NgayNhap, TrangThai) VALUES
('PN001','CN01','NV005','NCC01',1500000,'2026-05-13 09:00:00','Nháp')
ON CONFLICT DO NOTHING;
INSERT INTO CTPN (MaPN, MaLo, SoLuong, DonGiaNhap, ThanhTien) VALUES
('PN001','LO_CN01_NL001_002',10000,150,1500000)
ON CONFLICT DO NOTHING;

COMMIT;
