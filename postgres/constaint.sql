BEGIN;

ALTER TABLE chinhanh DROP CONSTRAINT IF EXISTS uq_chinhanh_ten;
ALTER TABLE chinhanh ADD CONSTRAINT uq_chinhanh_ten UNIQUE (tencn);

ALTER TABLE donvi DROP CONSTRAINT IF EXISTS uq_donvi_ten;
ALTER TABLE donvi ADD CONSTRAINT uq_donvi_ten UNIQUE (tendonvi);

ALTER TABLE nhacungcap DROP CONSTRAINT IF EXISTS uq_nhacungcap_ten;
ALTER TABLE nhacungcap ADD CONSTRAINT uq_nhacungcap_ten UNIQUE (tenncc);

ALTER TABLE sanpham DROP CONSTRAINT IF EXISTS uq_sanpham_ten;
ALTER TABLE sanpham ADD CONSTRAINT uq_sanpham_ten UNIQUE (tensp);

ALTER TABLE nguyenlieu DROP CONSTRAINT IF EXISTS uq_nguyenlieu_ten;
ALTER TABLE nguyenlieu ADD CONSTRAINT uq_nguyenlieu_ten UNIQUE (tennl);

CREATE INDEX IF NOT EXISTS idx_nhanvien_macn ON nhanvien(macn);
CREATE INDEX IF NOT EXISTS idx_hoadon_macn_createdat ON hoadon(macn, createdat);
CREATE INDEX IF NOT EXISTS idx_hoadon_trangthai ON hoadon(trangthai);
CREATE INDEX IF NOT EXISTS idx_hoadon_maca ON hoadon(maca);
CREATE INDEX IF NOT EXISTS idx_cthd_mahd ON cthd(mahd);
CREATE INDEX IF NOT EXISTS idx_cthd_masp ON cthd(masp);
CREATE INDEX IF NOT EXISTS idx_thanhtoan_mahd ON thanhtoan(mahd);
CREATE INDEX IF NOT EXISTS idx_thanhtoan_createdat ON thanhtoan(createdat);
CREATE INDEX IF NOT EXISTS idx_lohang_macn_manl_hsd ON lohang(macn, manl, hsd, ngaynhap);
CREATE INDEX IF NOT EXISTS idx_tonkho_macn_manl ON tonkho(macn, manl);
CREATE INDEX IF NOT EXISTS idx_phieunhap_macn_ngaynhap ON phieunhap(macn, ngaynhap);
CREATE INDEX IF NOT EXISTS idx_phieuxuat_macn_createdat ON phieuxuat(macn, createdat);
CREATE INDEX IF NOT EXISTS idx_phieuchuyen_xuat_nhap ON phieuchuyen(macn_xuat, macn_nhap);
CREATE INDEX IF NOT EXISTS idx_kiemkho_macn_ngaykiem ON kiemkho(macn, ngaykiem);
CREATE INDEX IF NOT EXISTS idx_inventory_macn_manl_createdat ON inventorytransaction(macn, manl, createdat);

CREATE INDEX IF NOT EXISTS idx_synclog_thucthe_record ON synclog(thucthe, recordid);
CREATE INDEX IF NOT EXISTS idx_auditlog_thucthe_record ON auditlog(thucthe, recordid);
CREATE INDEX IF NOT EXISTS idx_auditlog_createdat ON auditlog(createdat);

COMMIT;