-- ==============================================================================
-- 1. MASTER DATA (DỮ LIỆU GỐC - KHÔNG PHỤ THUỘC)
-- ==============================================================================

-- 1.1. CHI NHÁNH
INSERT INTO CHINHANH (MaCN, TenCN, DiaChi, TrangThai, CreatedAt) 
VALUES 
('CN01', 'Phúc Lộc Quận 1', '123 Lê Lợi, Q1, HCM', 1, CURRENT_TIMESTAMP),
('CN02', 'Phúc Lộc Thủ Đức', '45 Võ Văn Ngân, TP.Thủ Đức', 1, CURRENT_TIMESTAMP);

-- 1.2. ĐƠN VỊ TÍNH
INSERT INTO DONVI (MaDV, TenDonVi, TrangThai, CreatedAt) 
VALUES 
('DV_KG', 'Kilogram', 1, CURRENT_TIMESTAMP),
('DV_GRAM', 'Gram', 1, CURRENT_TIMESTAMP),
('DV_HOP', 'Hộp', 1, CURRENT_TIMESTAMP),
('DV_ML', 'Millilit', 1, CURRENT_TIMESTAMP);

-- 1.3. NHÀ CUNG CẤP
INSERT INTO NHACUNGCAP (MaNCC, TenNCC, TrangThai, CreatedAt) 
VALUES 
('NCC_TRUNGNGUYEN', 'Cà Phê Trung Nguyên', 1, CURRENT_TIMESTAMP),
('NCC_VINAMILK', 'Sữa Vinamilk', 1, CURRENT_TIMESTAMP);

-- 1.4. SẢN PHẨM (MENU)
INSERT INTO SANPHAM (MaSP, TenSP, GiaHienTai, IsTopping, TrangThai, CreatedAt) 
VALUES 
('SP_CFD', 'Cà Phê Đen Đá', 25000, FALSE, 1, CURRENT_TIMESTAMP),
('SP_CFS', 'Cà Phê Sữa Đá', 30000, FALSE, 1, CURRENT_TIMESTAMP),
('SP_TOP_TRANCHAU', 'Trân Châu Trắng', 5000, TRUE, 1, CURRENT_TIMESTAMP);

-- ==============================================================================
-- 2. DỮ LIỆU CẤP 2 (PHỤ THUỘC 1 KHÓA NGOẠI)
-- ==============================================================================

-- 2.1. NHÂN VIÊN
INSERT INTO NHANVIEN (MaNV, Username, PasswordHash, TenNV, ChucVu, MaCN, TrangThai, CreatedAt) 
VALUES 
('NV_ADMIN', 'khoahuynh', '$2a$10$...', 'Khoa Huỳnh', 'QUANLY', 'CN01', 1, CURRENT_TIMESTAMP),
('NV_THUNGAN01', 'thungan1', '$2a$10$...', 'Nguyễn Thị A', 'THUNGAN', 'CN01', 1, CURRENT_TIMESTAMP),
('NV_KHO01', 'thukho1', '$2a$10$...', 'Trần Văn B', 'KHO', 'CN01', 1, CURRENT_TIMESTAMP);

-- 2.2. NGUYÊN LIỆU
INSERT INTO NGUYENLIEU (MaNL, TenNL, DonViCoBan, TonToiThieu, TrangThai, CreatedAt) 
VALUES 
('NL_CF_HAT', 'Cà phê hạt Robusta', 'DV_KG', 10.00, 1, CURRENT_TIMESTAMP),
('NL_SUA_DAC', 'Sữa đặc Ngôi Sao', 'DV_HOP', 20.00, 1, CURRENT_TIMESTAMP),
('NL_DUONG', 'Đường tinh luyện', 'DV_KG', 15.00, 1, CURRENT_TIMESTAMP);

-- 2.3. QUY ĐỔI ĐƠN VỊ (1 Kg = 1000 Gram)
INSERT INTO QUYDOIDONVI (MaDV_From, MaDV_To, TyLeQuyDoi, TrangThai, CreatedAt) 
VALUES ('DV_KG', 'DV_GRAM', 1000.0000, 1, CURRENT_TIMESTAMP);

-- 2.4. PHIÊN BẢN CÔNG THỨC (Cho món Cà phê sữa)
INSERT INTO PHIENBANCONGTHUC (MaPB, MaSP, NgayHieuLuc, TrangThai, CreatedAt) 
VALUES ('PB_CFS_V1', 'SP_CFS', CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- ==============================================================================
-- 3. DỮ LIỆU CẤP 3 (PHỤ THUỘC NHIỀU KHÓA NGOẠI CÙNG LÚC)
-- ==============================================================================

-- 3.1. NGUYÊN LIỆU - ĐƠN VỊ TÍNH
INSERT INTO NGUYENLIEU_DONVI (MaNL, MaDV) VALUES ('NL_CF_HAT', 'DV_KG');
INSERT INTO NGUYENLIEU_DONVI (MaNL, MaDV) VALUES ('NL_CF_HAT', 'DV_GRAM');

-- 3.2. ĐỊNH MỨC CÔNG THỨC (Cà phê sữa đá cần: 20g Cà phê + 0.1 hộp sữa)
INSERT INTO DINHMUCCONGTHUC (MaPB, MaNL, SoLuong) 
VALUES 
('PB_CFS_V1', 'NL_CF_HAT', 0.0200),
('PB_CFS_V1', 'NL_SUA_DAC', 0.1000);

-- 3.3. TỒN KHO HIỆN TẠI
INSERT INTO TONKHO (MaCN, MaNL, SoLuongTon) 
VALUES 
('CN01', 'NL_CF_HAT', 50.50),
('CN01', 'NL_SUA_DAC', 120.00);

-- 3.4. LÔ HÀNG (Dùng cho FIFO - Nhập trước xuất trước)
INSERT INTO LOHANG (MaLo, MaNL, MaCN, NgayNhap, HSD, SoLuongCon, IsSynced) 
VALUES 
('LO_CF_001', 'NL_CF_HAT', 'CN01', CURRENT_TIMESTAMP, '2027-01-01', 50.50, TRUE),
('LO_SUA_001', 'NL_SUA_DAC', 'CN01', CURRENT_TIMESTAMP, '2026-12-31', 120.00, TRUE);

-- ==============================================================================
-- 4. DỮ LIỆU VẬN HÀNH: CA LÀM VIỆC & HÓA ĐƠN
-- ==============================================================================

-- 4.1. CA LÀM VIỆC
INSERT INTO CALAMVIEC (MaCa, MaNV, MaCN, ThoiGianMo, ThoiGianDong, TienDauCa, TienCuoiCa, SoTienThatThoat, IsSynced, CreatedAt) 
VALUES 
('CA_260510_SANG', 'NV_THUNGAN01', 'CN01', '2026-05-10 06:00:00', '2026-05-10 14:00:00', 500000, 1500000, 0, TRUE, CURRENT_TIMESTAMP);

-- 4.2. HÓA ĐƠN
INSERT INTO HOADON (MaHD, MaCa, MaCN, TongTien, TrangThai, IsSynced, CreatedAt) 
VALUES 
('HD_260510_001', 'CA_260510_SANG', 'CN01', 55000, 1, TRUE, CURRENT_TIMESTAMP);

-- 4.3. CHI TIẾT HÓA ĐƠN (1 Cà phê sữa + 1 Topping Trân châu)
INSERT INTO CTHD (ID, MaHD, MaSP, IDMonChinh, SoLuong, GiaBanTaiThoiDiem) 
VALUES 
('CTHD_001_MAIN', 'HD_260510_001', 'SP_CFS', NULL, 1, 30000), -- Món chính (IDMonChinh = NULL)
('CTHD_001_TOP1', 'HD_260510_001', 'SP_CFD', NULL, 1, 25000); -- Món chính thứ 2

-- ==============================================================================
-- 5. DỮ LIỆU QUẢN LÝ KHO (NHẬP, XUẤT, KIỂM, LỊCH SỬ GIAO DỊCH)
-- ==============================================================================

-- 5.1. PHIẾU NHẬP (Nhập từ nhà cung cấp)
INSERT INTO PHIEUNHAP (MaPN, MaCN, MaNV, MaNCC, TongTien, NgayNhap, TrangThai, IsSynced, CreatedAt) 
VALUES ('PN_260501_001', 'CN01', 'NV_KHO01', 'NCC_TRUNGNGUYEN', 5000000, '2026-05-01 10:00:00', 1, TRUE, CURRENT_TIMESTAMP);

-- Chi tiết phiếu nhập
INSERT INTO CTPN (MaPN, MaLo, SoLuong, DonGiaNhap, ThanhTien) 
VALUES ('PN_260501_001', 'LO_CF_001', 50.50, 100000, 5050000);

-- 5.2. KIỂM KHO
INSERT INTO KIEMKHO (MaKK, MaNV, MaCN, NgayKiem, IsSynced, CreatedAt) 
VALUES ('KK_260510_001', 'NV_ADMIN', 'CN01', CURRENT_TIMESTAMP, TRUE, CURRENT_TIMESTAMP);

-- Chi tiết kiểm kho (Hệ thống 50.5, Thực tế 50 -> Lệch -0.5)
INSERT INTO CTKK (MaKK, MaNL, SoLuongHeThong, SoLuongThucTe, ChenhLech) 
VALUES ('KK_260510_001', 'NL_CF_HAT', 50.50, 50.00, -0.50);

-- 5.3. INVENTORY TRANSACTION (Lịch sử biến động kho)
INSERT INTO INVENTORYTRANSACTION (MaTrans, MaCN, MaNL, MaLo, LoaiChungTu, IDChungTu, LoaiGiaoDich, SoLuong, TrangThai, IsSynced, CreatedAt) 
VALUES 
('TRANS_001', 'CN01', 'NL_CF_HAT', 'LO_CF_001', 'PHIEUNHAP', 'PN_260501_001', 1, 50.50, 1, TRUE, CURRENT_TIMESTAMP),
('TRANS_002', 'CN01', 'NL_CF_HAT', 'LO_CF_001', 'KIEMKHO', 'KK_260510_001', -1, -0.50, 1, TRUE, CURRENT_TIMESTAMP);

-- ==============================================================================
-- 6. SYSTEM LOGS (AUDIT, SYNC)
-- ==============================================================================

INSERT INTO AUDITLOG (LogID, MaNV, ThucThe, RecordID, HanhDong, DuLieuCu, DuLieuMoi, CreatedAt) 
VALUES 
('LOG_001', 'NV_ADMIN', 'SANPHAM', 'SP_CFS', 'UPDATE', '{"GiaHienTai": 28000}', '{"GiaHienTai": 30000}', CURRENT_TIMESTAMP);

INSERT INTO SYNCLOG (SyncID, ThucThe, RecordID, GhiChu) 
VALUES ('SYNC_001', 'HOADON', 'HD_260510_001', 'Đồng bộ từ Local Server lên Cloud DB thành công.');