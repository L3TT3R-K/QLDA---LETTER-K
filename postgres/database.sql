CREATE TABLE chinhanh (
    macn VARCHAR(20) PRIMARY KEY,
    tencn VARCHAR(100),
    diachi VARCHAR(255),
    trangthai INT, 
    createdat TIMESTAMP,
    updatedat TIMESTAMP
);

CREATE TABLE donvi (
    madv VARCHAR(20) PRIMARY KEY,
    tendonvi VARCHAR(50),
    trangthai INT,
    createdat TIMESTAMP,
    updatedat TIMESTAMP
);

CREATE TABLE nhacungcap (
    mancc VARCHAR(50) PRIMARY KEY,
    tenncc VARCHAR(150),
    trangthai INT,
    createdat TIMESTAMP,
    updatedat TIMESTAMP
);

CREATE TABLE sanpham (
    masp VARCHAR(50) PRIMARY KEY,
    tensp VARCHAR(150),
    giahientai DECIMAL(18,0),
    istopping BOOLEAN, 
    trangthai INT,
    createdat TIMESTAMP,
    updatedat TIMESTAMP
);

CREATE TABLE nhanvien (
    manv VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    passwordhash VARCHAR(255),
    tennv VARCHAR(100),
    chucvu VARCHAR(20),
    macn VARCHAR(20) REFERENCES chinhanh(macn),
    trangthai INT,
    createdat TIMESTAMP,
    updatedat TIMESTAMP
);

CREATE TABLE nguyenlieu (
    manl VARCHAR(50) PRIMARY KEY,
    tennl VARCHAR(150),
    donvicoban VARCHAR(20) REFERENCES donvi(madv),
    tontoithieu DECIMAL(18,2),
    trangthai INT,
    createdat TIMESTAMP,
    updatedat TIMESTAMP
);

CREATE TABLE nguyenlieu_donvi (
    manl VARCHAR(50) REFERENCES nguyenlieu(manl),
    madv VARCHAR(20) REFERENCES donvi(madv),
    PRIMARY KEY (manl, madv)
);

CREATE TABLE quydoidonvi (
    madv_from VARCHAR(20) REFERENCES donvi(madv),
    madv_to VARCHAR(20) REFERENCES donvi(madv),
    tylequydoi DECIMAL(18,4),
    trangthai INT,
    createdat TIMESTAMP,
    updatedat TIMESTAMP,
    PRIMARY KEY (madv_from, madv_to)
);

CREATE TABLE phienbancongthuc (
    mapb VARCHAR(50) PRIMARY KEY,
    masp VARCHAR(50) REFERENCES sanpham(masp),
    ngayhieuluc TIMESTAMP,
    trangthai INT, 
    createdat TIMESTAMP,
    updatedat TIMESTAMP
);

CREATE TABLE dinhmuccongthuc (
    mapb VARCHAR(50) REFERENCES phienbancongthuc(mapb),
    manl VARCHAR(50) REFERENCES nguyenlieu(manl),
    soluong DECIMAL(18,4),
    PRIMARY KEY (mapb, manl)
);

CREATE TABLE calamviec (
    maca VARCHAR(50) PRIMARY KEY,
    manv VARCHAR(50) REFERENCES nhanvien(manv),
    macn VARCHAR(20) REFERENCES chinhanh(macn),
    thoigianmo TIMESTAMP,
    thoigiandong TIMESTAMP NULL,
    tiendauca DECIMAL(18,0),
    tiencuoica DECIMAL(18,0),
    sotienthatthoat DECIMAL(18,0),
    lydogiaitrinh VARCHAR(255) NULL,
    issynced BOOLEAN,
    createdat TIMESTAMP
);

CREATE TABLE hoadon (
    mahd VARCHAR(50) PRIMARY KEY,
    maca VARCHAR(50) REFERENCES calamviec(maca),
    macn VARCHAR(20) REFERENCES chinhanh(macn),
    tongtien DECIMAL(18,0),
    trangthai INT, 
    issynced BOOLEAN,
    createdat TIMESTAMP
);

CREATE TABLE cthd (
    id VARCHAR(50) PRIMARY KEY,
    mahd VARCHAR(50) REFERENCES hoadon(mahd),
    masp VARCHAR(50) REFERENCES sanpham(masp),
    idmonchinh VARCHAR(50) NULL REFERENCES cthd(id), 
    soluong INT,
    giabantaithoidiem DECIMAL(18,0),
    ghichu VARCHAR(255) NULL
);

CREATE TABLE thanhtoan (
    matt VARCHAR(50) PRIMARY KEY,
    mahd VARCHAR(50) REFERENCES hoadon(mahd),
    phuongthuc VARCHAR(20),
    sotien DECIMAL(18,0),
    trangthai INT,
    issynced BOOLEAN,
    createdat TIMESTAMP
);

CREATE TABLE tonkho (
    macn VARCHAR(20) REFERENCES chinhanh(macn),
    manl VARCHAR(50) REFERENCES nguyenlieu(manl),
    soluongton DECIMAL(18,2),
    PRIMARY KEY (macn, manl)
);

CREATE TABLE lohang (
    malo VARCHAR(50) PRIMARY KEY,
    manl VARCHAR(50) REFERENCES nguyenlieu(manl),
    macn VARCHAR(20) REFERENCES chinhanh(macn),
    ngaynhap TIMESTAMP,
    hsd DATE,
    soluongcon DECIMAL(18,2),
    issynced BOOLEAN
);

CREATE TABLE kiemkho (
    makk VARCHAR(50) PRIMARY KEY,
    manv VARCHAR(50) REFERENCES nhanvien(manv),
    macn VARCHAR(20) REFERENCES chinhanh(macn),
    ngaykiem TIMESTAMP,
    issynced BOOLEAN,
    createdat TIMESTAMP
);

CREATE TABLE ctkk (
    makk VARCHAR(50) REFERENCES kiemkho(makk),
    manl VARCHAR(50) REFERENCES nguyenlieu(manl),
    soluonghethong DECIMAL(18,2),
    soluongthucte DECIMAL(18,2),
    chenhlech DECIMAL(18,2),
    PRIMARY KEY (makk, manl)
);

CREATE TABLE phieunhap (
    mapn VARCHAR(50) PRIMARY KEY,
    macn VARCHAR(20) REFERENCES chinhanh(macn),
    manv VARCHAR(50) REFERENCES nhanvien(manv),
    mancc VARCHAR(50) REFERENCES nhacungcap(mancc),
    tongtien DECIMAL(18,0),
    ngaynhap TIMESTAMP,
    trangthai INT,
    issynced BOOLEAN,
    createdat TIMESTAMP
);

CREATE TABLE ctpn (
    mapn VARCHAR(50) REFERENCES phieunhap(mapn),
    malo VARCHAR(50) REFERENCES lohang(malo),
    soluong DECIMAL(18,2),
    dongianhap DECIMAL(18,0),
    thanhtien DECIMAL(18,0),
    PRIMARY KEY (mapn, malo)
);

CREATE TABLE phieuxuat (
    mapx VARCHAR(50) PRIMARY KEY,
    macn VARCHAR(20) REFERENCES chinhanh(macn),
    manv VARCHAR(50) REFERENCES nhanvien(manv),
    lydo VARCHAR(255),
    trangthai INT,
    issynced BOOLEAN,
    createdat TIMESTAMP
);

CREATE TABLE ctpx (
    mapx VARCHAR(50) REFERENCES phieuxuat(mapx),
    malo VARCHAR(50) REFERENCES lohang(malo),
    soluong DECIMAL(18,2),
    PRIMARY KEY (mapx, malo)
);

CREATE TABLE phieuchuyen (
    mapc VARCHAR(50) PRIMARY KEY,
    macn_xuat VARCHAR(20) REFERENCES chinhanh(macn),
    macn_nhap VARCHAR(20) REFERENCES chinhanh(macn),
    manv VARCHAR(50) REFERENCES nhanvien(manv),
    trangthai INT, 
    issynced BOOLEAN,
    createdat TIMESTAMP
);

CREATE TABLE ctpc (
    mapc VARCHAR(50) REFERENCES phieuchuyen(mapc),
    malo VARCHAR(50) REFERENCES lohang(malo),
    soluong DECIMAL(18,2),
    PRIMARY KEY (mapc, malo)
);

CREATE TABLE inventorytransaction (
    matrans VARCHAR(50) PRIMARY KEY,
    macn VARCHAR(20) REFERENCES chinhanh(macn),
    manl VARCHAR(50) REFERENCES nguyenlieu(manl),
    malo VARCHAR(50) NULL REFERENCES lohang(malo),
    loaichungtu VARCHAR(20),
    idchungtu VARCHAR(50),
    loaigiaodich INT,
    soluong DECIMAL(18,2),
    trangthai INT,
    issynced BOOLEAN,
    createdat TIMESTAMP
);

CREATE TABLE synclog (
    syncid VARCHAR(50) PRIMARY KEY,
    thucthe VARCHAR(50),
    recordid VARCHAR(50),
    ghichu TEXT
);

CREATE TABLE conflictlog (
    conflictid VARCHAR(50) PRIMARY KEY,
    datalocal JSONB,
    dataserver JSONB
);

CREATE TABLE auditlog (
    logid VARCHAR(50) PRIMARY KEY,
    manv VARCHAR(50),
    thucthe VARCHAR(50),
    recordid VARCHAR(50),
    hanhdong VARCHAR(20),
    dulieucu JSONB NULL,
    dulieumoi JSONB NULL,
    createdat TIMESTAMP
);

