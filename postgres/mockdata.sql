BEGIN;

INSERT INTO chinhanh (macn, tencn, diachi, trangthai) VALUES
('CN01','Phụng Lộc Coffee - Quận 1','12 Nguyễn Huệ, Quận 1, TP.HCM', 1),
('CN02','Phụng Lộc Coffee - Quận 3','25 Võ Văn Tần, Quận 3, TP.HCM', 1),
('CN03','Phụng Lộc Coffee - Bình Thạnh','88 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM', 1),
('CN04','Phụng Lộc Coffee - Thủ Đức','45 Võ Văn Ngân, Thủ Đức, TP.HCM', 1),
('CN05','Phụng Lộc Coffee - Gò Vấp','102 Phan Văn Trị, Gò Vấp, TP.HCM', 1),
('CN06','Phụng Lộc Coffee - Tân Bình','70 Cộng Hòa, Tân Bình, TP.HCM', 1),
('CN07','Phụng Lộc Coffee - Quận 7','15 Nguyễn Thị Thập, Quận 7, TP.HCM', 1),
('CN08','Phụng Lộc Coffee - Phú Nhuận','33 Phan Đăng Lưu, Phú Nhuận, TP.HCM', 1);

INSERT INTO donvi (madv, tendonvi) VALUES
('GRAM','Gram'),('KG','Kilogram'),('ML','Mililít'),('LIT','Lít'),('CAI','Cái'),('HOP','Hộp'),('CHAI','Chai'),('LON','Lon'),('GOI','Gói');

INSERT INTO nhacungcap (mancc, tenncc, trangthai) VALUES
('NCC01','Công ty Cà phê Buôn Ma Thuột', 1),
('NCC02','Công ty Sữa Việt', 1),
('NCC03','Nhà cung cấp Topping Sài Gòn', 1),
('NCC04','Công ty Bao bì F&B', 1);

-- Đã tích hợp Username và PasswordHash vào bảng NhanVien
INSERT INTO nhanvien (manv, tennv, chucvu, macn, username, passwordhash, trangthai) VALUES
('NV001','Nguyễn Văn An','ADMIN',NULL,'admin','$2a$10$QG.9XTiVePNgbBGdan2/IeXFUnObAP24c7rbS5/pLa87umZ7vB3de', 1),
('NV002','Trần Thị Bình','QUANLY_CHINHANH','CN01','manager_cn01','$2a$10$DowJonesDemoHashFor123456xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 1),
('NV003','Lê Văn Cường','NHANVIEN_BANHANG','CN01','cashier_cn01','$2a$10$DowJonesDemoHashFor123456xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 1),
('NV004','Phạm Thị Dung','PHA_CHE','CN01',NULL,NULL, 1),
('NV005','Hoàng Văn Em','NHANVIEN_KHO','CN01','stock_cn01','$2a$10$DowJonesDemoHashFor123456xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 1),
('NV006','Đỗ Thị Hoa','QUANLY_CHINHANH','CN02','manager_cn02','$2a$10$DowJonesDemoHashFor123456xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 1),
('NV007','Võ Văn Khang','NHANVIEN_BANHANG','CN02','cashier_cn02','$2a$10$DowJonesDemoHashFor123456xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 1),
('NV008','Ngô Thị Lan','KETOAN',NULL,'ketoan','$2a$10$DowJonesDemoHashFor123456xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 1);

INSERT INTO sanpham (masp, tensp, giahientai, istopping, trangthai) VALUES
('SP001','Cà phê đen đá',25000,FALSE, 1),
('SP002','Cà phê sữa đá',30000,FALSE, 1),
('SP003','Bạc xỉu',35000,FALSE, 1),
('SP004','Trà đào cam sả',45000,FALSE, 1),
('SP005','Trà sữa truyền thống',40000,FALSE, 1),
('SP006','Matcha đá xay',55000,FALSE, 1),
('SP007','Bánh tiramisu',45000,FALSE, 1),
('SPT01','Trân châu đen',7000,TRUE, 1),
('SPT02','Kem cheese',10000,TRUE, 1),
('SPT03','Thạch cà phê',8000,TRUE, 1);

INSERT INTO nguyenlieu (manl, tennl, donvicoban, tontoithieu, trangthai) VALUES
('NL001','Cà phê bột','GRAM',5000, 1),('NL002','Sữa đặc','ML',3000, 1),('NL003','Sữa tươi','ML',5000, 1),
('NL004','Đường','GRAM',3000, 1),('NL005','Đá viên','GRAM',10000, 1),('NL006','Trà đào','ML',3000, 1),
('NL007','Cam tươi','GRAM',2000, 1),('NL008','Sả','GRAM',500, 1),('NL009','Bột matcha','GRAM',1000, 1),
('NL010','Trân châu đen','GRAM',2000, 1),('NL011','Kem cheese','GRAM',1000, 1),('NL012','Ly nhựa','CAI',500, 1),('NL013','Ống hút','CAI',500, 1);

INSERT INTO nguyenlieu_donvi (manl, madv) VALUES
('NL001','GRAM'),('NL001','KG'),('NL002','ML'),('NL002','LIT'),('NL003','ML'),('NL003','LIT'),
('NL004','GRAM'),('NL004','KG'),('NL005','GRAM'),('NL005','KG'),('NL006','ML'),('NL006','LIT'),
('NL007','GRAM'),('NL007','KG'),('NL008','GRAM'),('NL008','KG'),('NL009','GRAM'),('NL009','KG'),
('NL010','GRAM'),('NL010','KG'),('NL011','GRAM'),('NL011','KG'),('NL012','CAI'),('NL013','CAI');

INSERT INTO quydoidonvi (madv_from, madv_to, tylequydoi, trangthai) VALUES
('KG','GRAM',1000, 1),('LIT','ML',1000, 1),('HOP','CAI',12, 1),('GOI','CAI',50, 1);

INSERT INTO phienbancongthuc (mapb, masp, ngayhieuluc, trangthai) VALUES
('PB001','SP001','2026-01-01', 1),('PB002','SP002','2026-01-01', 1),('PB003','SP003','2026-01-01', 1),
('PB004','SP004','2026-01-01', 1),('PB005','SP005','2026-01-01', 1),('PB006','SP006','2026-01-01', 1),
('PB_T01','SPT01','2026-01-01', 1),('PB_T02','SPT02','2026-01-01', 1),('PB_T03','SPT03','2026-01-01', 1);

INSERT INTO dinhmuccongthuc (mapb, manl, soluong) VALUES
('PB001','NL001',20),('PB001','NL004',10),('PB001','NL005',150),('PB001','NL012',1),('PB001','NL013',1),
('PB002','NL001',20),('PB002','NL002',30),('PB002','NL005',150),('PB002','NL012',1),('PB002','NL013',1),
('PB003','NL001',10),('PB003','NL002',35),('PB003','NL003',100),('PB003','NL005',150),('PB003','NL012',1),('PB003','NL013',1),
('PB004','NL006',120),('PB004','NL007',50),('PB004','NL008',5),('PB004','NL004',15),('PB004','NL005',150),('PB004','NL012',1),('PB004','NL013',1),
('PB005','NL003',150),('PB005','NL004',20),('PB005','NL005',150),('PB005','NL012',1),('PB005','NL013',1),
('PB006','NL009',15),('PB006','NL003',180),('PB006','NL004',20),('PB006','NL005',200),('PB006','NL012',1),('PB006','NL013',1),
('PB_T01','NL010',50),('PB_T02','NL011',40),('PB_T03','NL001',5),('PB_T03','NL004',10);

INSERT INTO lohang (malo, manl, macn, ngaynhap, hsd, soluongcon) VALUES
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
('LO_CN02_NL013_001','NL013','CN02','2026-05-01',NULL,1500);

INSERT INTO tonkho (macn, manl, soluongton)
SELECT macn, manl, SUM(soluongcon) FROM lohang GROUP BY macn, manl;

INSERT INTO calamviec (maca, manv, macn, thoigianmo, tiendauca) VALUES
('CA001','NV003','CN01','2026-05-13 07:00:00',1000000),
('CA002','NV007','CN02','2026-05-13 07:00:00',800000);

INSERT INTO hoadon (mahd, maca, macn, tongtien, trangthai) VALUES
('HD001','CA001','CN01', 74000, 1),
('HD002','CA002','CN02', 70000, 1);

INSERT INTO cthd (id, mahd, masp, soluong, giabantaithoidiem) VALUES
('CTHD001','HD001','SP002',2,30000),
('CTHD002','HD001','SPT01',2,7000),
('CTHD003','HD002','SP001',1,25000),
('CTHD004','HD002','SP004',1,45000);

INSERT INTO lohang (malo, manl, macn, ngaynhap, hsd, soluongcon) VALUES
('LO_CN01_NL001_002','NL001','CN01','2026-05-13','2026-12-31',0);

INSERT INTO phieunhap (mapn, macn, manv, mancc, tongtien, ngaynhap, trangthai) VALUES
('PN001','CN01','NV005','NCC01',1500000,'2026-05-13 09:00:00', 1);

INSERT INTO ctpn (mapn, malo, soluong, dongianhap, thanhtien) VALUES
('PN001','LO_CN01_NL001_002',10000,150,1500000);

COMMIT;