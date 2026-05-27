package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.CTPhieuNhapRequest;
import com.phungloccoffee.backend.dto.CTPhieuNhapResponse;
import com.phungloccoffee.backend.dto.PhieuNhapRequest;
import com.phungloccoffee.backend.dto.PhieuNhapResponse;
import com.phungloccoffee.backend.entity.CTPhieuNhap;
import com.phungloccoffee.backend.entity.ChiNhanh;
import com.phungloccoffee.backend.entity.InventoryTransaction;
import com.phungloccoffee.backend.entity.LoHang;
import com.phungloccoffee.backend.entity.NguyenLieu;
import com.phungloccoffee.backend.entity.NhaCungCap;
import com.phungloccoffee.backend.entity.NhanVien;
import com.phungloccoffee.backend.entity.PhieuNhap;
import com.phungloccoffee.backend.entity.TonKho;
import com.phungloccoffee.backend.entity.TonKho_ID;
import com.phungloccoffee.backend.repository.CTPhieuNhapRepository;
import com.phungloccoffee.backend.repository.ChiNhanhRepository;
import com.phungloccoffee.backend.repository.InventoryTransactionRepository;
import com.phungloccoffee.backend.repository.LoHangRepository;
import com.phungloccoffee.backend.repository.NguyenLieuRepository;
import com.phungloccoffee.backend.repository.NhaCungCapRepository;
import com.phungloccoffee.backend.repository.NhanVienRepository;
import com.phungloccoffee.backend.repository.PhieuNhapRepository;
import com.phungloccoffee.backend.repository.TonKhoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PhieuNhapService {

    private static final String NGUON_NHA_CUNG_CAP = "NHA_CUNG_CAP";
    private static final String NGUON_KHO_TONG = "KHO_TONG";
    private static final Integer TRANG_THAI_DA_NHAP_KHO = 1;
    private static final Integer TRANG_THAI_HOP_LE = 1;

    @Autowired private PhieuNhapRepository phieuNhapRepository;
    @Autowired private CTPhieuNhapRepository ctPhieuNhapRepository;
    @Autowired private NhaCungCapRepository nhaCungCapRepository;
    @Autowired private ChiNhanhRepository chiNhanhRepository;
    @Autowired private NhanVienRepository nhanVienRepository;
    @Autowired private NguyenLieuRepository nguyenLieuRepository;
    @Autowired private LoHangRepository loHangRepository;
    @Autowired private TonKhoRepository tonKhoRepository;
    @Autowired private InventoryTransactionRepository inventoryTransactionRepository;

    @Transactional
    public PhieuNhapResponse taoPhieuNhap(PhieuNhapRequest request) {
        validateRequest(request);

        String maPN = normalizeMaPN(request.getMaPN());
        if (phieuNhapRepository.existsById(maPN)) {
            throw new IllegalArgumentException("Ma phieu nhap da ton tai: " + maPN);
        }

        String loaiNguon = normalizeLoaiNguon(request);
        NhaCungCap nhaCungCap = null;
        ChiNhanh khoNguon = null;
        if (NGUON_NHA_CUNG_CAP.equals(loaiNguon)) {
            nhaCungCap = nhaCungCapRepository.findById(request.getMaNCC())
                    .orElseThrow(() -> new IllegalArgumentException("Khong tim thay nha cung cap: " + request.getMaNCC()));
        } else {
            khoNguon = chiNhanhRepository.findById(request.getMaKhoNguon())
                    .orElseThrow(() -> new IllegalArgumentException("Khong tim thay kho tong: " + request.getMaKhoNguon()));
        }
        ChiNhanh chiNhanh = chiNhanhRepository.findById(request.getMaCN())
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay chi nhanh: " + request.getMaCN()));
        NhanVien nhanVien = nhanVienRepository.findById(request.getMaNV())
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay nhan vien: " + request.getMaNV()));

        PhieuNhap phieuNhap = new PhieuNhap();
        phieuNhap.setMaPN(maPN);
        phieuNhap.setNhaCungCap(nhaCungCap);
        phieuNhap.setChiNhanh(chiNhanh);
        phieuNhap.setNhanVien(nhanVien);
        phieuNhap.setNgayNhap(request.getNgayNhap() != null ? request.getNgayNhap() : LocalDateTime.now());
        phieuNhap.setTrangThai(TRANG_THAI_DA_NHAP_KHO);
        phieuNhap.setIsSynced(false);

        double tongTien = 0.0;
        PhieuNhap savedPhieuNhap = phieuNhapRepository.save(phieuNhap);

        for (CTPhieuNhapRequest chiTietRequest : request.getChiTiet()) {
            if (NGUON_NHA_CUNG_CAP.equals(loaiNguon)) {
                tongTien += nhapTuNhaCungCap(savedPhieuNhap, chiNhanh, chiTietRequest);
            } else {
                tongTien += nhapTuKhoTong(savedPhieuNhap, khoNguon, chiNhanh, chiTietRequest);
            }
        }

        savedPhieuNhap.setTongTien(toBigDecimal(tongTien));
        return toResponse(phieuNhapRepository.save(savedPhieuNhap));
    }

    @Transactional
    public PhieuNhapResponse capNhatPhieuNhap(String maPN, PhieuNhapRequest request) {
        if (isBlank(maPN)) {
            throw new IllegalArgumentException("Ma phieu nhap khong duoc de trong");
        }
        if (request == null) {
            throw new IllegalArgumentException("Du lieu phieu nhap khong duoc de trong");
        }
        PhieuNhap existing = phieuNhapRepository.findById(maPN)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay phieu nhap: " + maPN));

        request.setMaPN(maPN.trim());
        validateRequest(request);
        hoanTacVaXoaPhieuNhap(existing);
        phieuNhapRepository.flush();
        return taoPhieuNhap(request);
    }

    @Transactional
    public void xoaPhieuNhap(String maPN) {
        if (isBlank(maPN)) {
            throw new IllegalArgumentException("Ma phieu nhap khong duoc de trong");
        }
        PhieuNhap existing = phieuNhapRepository.findById(maPN)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay phieu nhap: " + maPN));
        hoanTacVaXoaPhieuNhap(existing);
    }

    public List<PhieuNhapResponse> getAll() {
        return phieuNhapRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PhieuNhapResponse getById(String maPN) {
        PhieuNhap phieuNhap = phieuNhapRepository.findById(maPN)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay phieu nhap: " + maPN));
        return toResponse(phieuNhap);
    }

    public List<PhieuNhapResponse> getByNhaCungCap(String maNCC) {
        return phieuNhapRepository.findByNhaCungCapMaNCC(maNCC).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PhieuNhapResponse> getByChiNhanh(String maCN) {
        return phieuNhapRepository.findByChiNhanhMaCN(maCN).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private void hoanTacVaXoaPhieuNhap(PhieuNhap phieuNhap) {
        List<CTPhieuNhap> chiTietList = ctPhieuNhapRepository.findByMaPN(phieuNhap.getMaPN());
        List<InventoryTransaction> giaoDichList = inventoryTransactionRepository
                .findByLoaiChungTuAndIdChungTu("PHIEUNHAP", phieuNhap.getMaPN());

        for (CTPhieuNhap chiTiet : chiTietList) {
            LoHang loHang = loHangRepository.findById(chiTiet.getMaLo())
                    .orElseThrow(() -> new IllegalArgumentException("Khong tim thay lo hang cua phieu nhap: " + chiTiet.getMaLo()));
            NguyenLieu nguyenLieu = getNguyenLieuFromLo(loHang);
            double soLuongNhap = valueOrZero(chiTiet.getSoLuong());
            double soLuongCon = valueOrZero(loHang.getSoLuongCon());
            if (Math.abs(soLuongCon - soLuongNhap) > 0.000001) {
                throw new IllegalArgumentException("Khong the sua/xoa phieu nhap vi lo " + loHang.getMaLo()
                        + " da phat sinh thay doi ton kho. So luong con: " + soLuongCon);
            }
            if (loHang.getChiNhanh() == null) {
                throw new IllegalArgumentException("Lo hang chua gan chi nhanh: " + loHang.getMaLo());
            }
            truTonKhoBatBuoc(loHang.getChiNhanh().getMaCN(), nguyenLieu.getMaNL(), soLuongNhap);
        }

        for (InventoryTransaction giaoDich : giaoDichList) {
            if (Integer.valueOf(3).equals(giaoDich.getLoaiGiaoDich())) {
                hoanTraKhoNguon(giaoDich);
            }
        }

        inventoryTransactionRepository.deleteAll(giaoDichList);
        ctPhieuNhapRepository.deleteAll(chiTietList);
        for (CTPhieuNhap chiTiet : chiTietList) {
            loHangRepository.deleteById(chiTiet.getMaLo());
        }
        phieuNhapRepository.delete(phieuNhap);
    }

    private void hoanTraKhoNguon(InventoryTransaction giaoDich) {
        if (isBlank(giaoDich.getMaCN()) || isBlank(giaoDich.getMaNL()) || isBlank(giaoDich.getMaLo())) {
            return;
        }
        double soLuong = valueOrZero(giaoDich.getSoLuong());
        loHangRepository.findById(giaoDich.getMaLo()).ifPresent(loHang -> {
            double soLuongCon = valueOrZero(loHang.getSoLuongCon());
            loHang.setSoLuongCon(toBigDecimal(soLuongCon + soLuong));
            loHangRepository.save(loHang);
        });
        congTonKho(giaoDich.getMaCN(), giaoDich.getMaNL(), soLuong);
    }

    private void truTonKhoBatBuoc(String maCN, String maNL, double soLuong) {
        TonKho_ID tonKhoId = new TonKho_ID(maCN, maNL);
        TonKho tonKho = tonKhoRepository.findById(tonKhoId)
                .orElseThrow(() -> new IllegalArgumentException("Nguyen lieu chua co ton kho tai chi nhanh: " + maNL));
        double tonHienTai = valueOrZero(tonKho.getSoLuongTon());
        if (tonHienTai < soLuong) {
            throw new IllegalArgumentException("Khong du ton kho de hoan tac phieu nhap cho nguyen lieu "
                    + maNL + ". Ton hien tai: " + tonHienTai);
        }
        tonKho.setSoLuongTon(tonHienTai - soLuong);
        tonKhoRepository.save(tonKho);
    }

    private void validateRequest(PhieuNhapRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Du lieu phieu nhap khong duoc de trong");
        }
        if (isBlank(request.getMaCN())) {
            throw new IllegalArgumentException("Ma chi nhanh khong duoc de trong");
        }
        if (isBlank(request.getMaNV())) {
            throw new IllegalArgumentException("Ma nhan vien khong duoc de trong");
        }
        String loaiNguon = normalizeLoaiNguon(request);
        if (NGUON_NHA_CUNG_CAP.equals(loaiNguon) && isBlank(request.getMaNCC())) {
            throw new IllegalArgumentException("Ma nha cung cap khong duoc de trong khi nhap tu nha cung cap");
        }
        if (NGUON_KHO_TONG.equals(loaiNguon)) {
            if (isBlank(request.getMaKhoNguon())) {
                throw new IllegalArgumentException("Ma kho tong khong duoc de trong khi nhap tu kho tong");
            }
            if (request.getMaKhoNguon().trim().equals(request.getMaCN().trim())) {
                throw new IllegalArgumentException("Kho nguon va kho nhap phai khac nhau");
            }
        }
        if (request.getChiTiet() == null || request.getChiTiet().isEmpty()) {
            throw new IllegalArgumentException("Phieu nhap phai co it nhat mot dong chi tiet");
        }
        for (CTPhieuNhapRequest chiTiet : request.getChiTiet()) {
            if (chiTiet == null || isBlank(chiTiet.getMaNL())) {
                throw new IllegalArgumentException("Ma nguyen lieu khong duoc de trong");
            }
            if (chiTiet.getSoLuong() == null || chiTiet.getSoLuong() <= 0) {
                throw new IllegalArgumentException("So luong nhap phai lon hon 0");
            }
            if (chiTiet.getDonGiaNhap() != null && chiTiet.getDonGiaNhap() < 0) {
                throw new IllegalArgumentException("Don gia khong duoc am");
            }
        }
    }

    private double nhapTuNhaCungCap(PhieuNhap phieuNhap, ChiNhanh chiNhanh, CTPhieuNhapRequest chiTietRequest) {
        NguyenLieu nguyenLieu = nguyenLieuRepository.findById(chiTietRequest.getMaNL())
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay nguyen lieu: " + chiTietRequest.getMaNL()));
        String maLo = normalizeMaLo(chiTietRequest.getMaLo());
        if (loHangRepository.existsById(maLo)) {
            throw new IllegalArgumentException("Ma lo da ton tai: " + maLo);
        }
        return taoDongNhap(phieuNhap, chiNhanh, nguyenLieu, maLo, chiTietRequest.getSoLuong(),
                chiTietRequest.getDonGiaNhap(), chiTietRequest.getHanSuDung());
    }

    private double nhapTuKhoTong(PhieuNhap phieuNhap, ChiNhanh khoNguon, ChiNhanh khoDich, CTPhieuNhapRequest chiTietRequest) {
        List<LoHang> loNguonList = layLoNguon(khoNguon.getMaCN(), chiTietRequest);
        double soLuongCanNhap = chiTietRequest.getSoLuong();
        double tongTien = 0.0;

        for (LoHang loNguon : loNguonList) {
            if (soLuongCanNhap <= 0) {
                break;
            }
            NguyenLieu nguyenLieu = getNguyenLieuFromLo(loNguon);
            double soLuongCon = valueOrZero(loNguon.getSoLuongCon());
            double soLuongNhap = Math.min(soLuongCon, soLuongCanNhap);
            if (soLuongNhap <= 0) {
                continue;
            }

            truLoHang(loNguon, soLuongNhap);
            truTonKho(khoNguon.getMaCN(), nguyenLieu.getMaNL(), soLuongNhap);
            ghiGiaoDichKhoTong(phieuNhap.getMaPN(), khoNguon.getMaCN(), nguyenLieu.getMaNL(), loNguon.getMaLo(), soLuongNhap);

            String maLoDich = normalizeMaLo(soLuongCanNhap == chiTietRequest.getSoLuong() ? chiTietRequest.getMaLo() : null);
            while (loHangRepository.existsById(maLoDich)) {
                maLoDich = normalizeMaLo(null);
            }
            tongTien += taoDongNhap(phieuNhap, khoDich, nguyenLieu, maLoDich, soLuongNhap,
                    chiTietRequest.getDonGiaNhap(),
                    chiTietRequest.getHanSuDung() != null ? chiTietRequest.getHanSuDung() : loNguon.getHanSuDung());
            soLuongCanNhap -= soLuongNhap;
        }

        if (soLuongCanNhap > 0) {
            throw new IllegalArgumentException("Kho tong khong du so luong cho nguyen lieu " + chiTietRequest.getMaNL());
        }
        return tongTien;
    }

    private double taoDongNhap(PhieuNhap phieuNhap, ChiNhanh chiNhanh, NguyenLieu nguyenLieu, String maLo,
                              double soLuong, Double donGiaNhap, java.time.LocalDate hanSuDung) {
        double donGia = donGiaNhap != null ? donGiaNhap : 0.0;
        double thanhTien = soLuong * donGia;

        LoHang loHang = new LoHang();
        loHang.setMaLo(maLo);
        loHang.setNguyenLieu(nguyenLieu);
        loHang.setChiNhanh(chiNhanh);
        loHang.setNgayNhap(phieuNhap.getNgayNhap());
        loHang.setHanSuDung(hanSuDung);
        loHang.setSoLuongCon(toBigDecimal(soLuong));
        loHang.setIsSynced(false);
        loHangRepository.save(loHang);

        CTPhieuNhap chiTiet = new CTPhieuNhap();
        chiTiet.setMaPN(phieuNhap.getMaPN());
        chiTiet.setMaLo(maLo);
        chiTiet.setSoLuong(toBigDecimal(soLuong));
        chiTiet.setDonGiaNhap(toBigDecimal(donGia));
        chiTiet.setThanhTien(toBigDecimal(thanhTien));
        ctPhieuNhapRepository.save(chiTiet);

        congTonKho(chiNhanh.getMaCN(), nguyenLieu.getMaNL(), soLuong);
        ghiGiaoDichNhapKho(phieuNhap.getMaPN(), chiNhanh.getMaCN(), nguyenLieu.getMaNL(), maLo, soLuong);
        return thanhTien;
    }

    private List<LoHang> layLoNguon(String maKhoNguon, CTPhieuNhapRequest chiTietRequest) {
        if (!isBlank(chiTietRequest.getMaLoNguon())) {
            LoHang loNguon = loHangRepository.findById(chiTietRequest.getMaLoNguon().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Khong tim thay lo nguon: " + chiTietRequest.getMaLoNguon()));
            if (loNguon.getChiNhanh() == null || !maKhoNguon.equals(loNguon.getChiNhanh().getMaCN())) {
                throw new IllegalArgumentException("Lo nguon khong thuoc kho tong: " + chiTietRequest.getMaLoNguon());
            }
            if (!isBlank(chiTietRequest.getMaNL()) && !chiTietRequest.getMaNL().trim().equals(getNguyenLieuFromLo(loNguon).getMaNL())) {
                throw new IllegalArgumentException("Lo nguon khong dung nguyen lieu can nhap: " + chiTietRequest.getMaLoNguon());
            }
            return List.of(loNguon);
        }

        NguyenLieu nguyenLieu = nguyenLieuRepository.findById(chiTietRequest.getMaNL())
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay nguyen lieu: " + chiTietRequest.getMaNL()));
        List<LoHang> result = new ArrayList<>(loHangRepository.findByNguyenLieuMaNLAndChiNhanhMaCN(nguyenLieu.getMaNL(), maKhoNguon));
        result.sort(Comparator
                .comparing(LoHang::getHanSuDung, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(LoHang::getNgayNhap, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(LoHang::getMaLo));
        return result;
    }

    private void truLoHang(LoHang loHang, double soLuong) {
        double soLuongCon = valueOrZero(loHang.getSoLuongCon());
        if (soLuongCon < soLuong) {
            throw new IllegalArgumentException("Khong du so luong trong lo nguon " + loHang.getMaLo() + ". Con lai: " + soLuongCon);
        }
        loHang.setSoLuongCon(toBigDecimal(soLuongCon - soLuong));
        loHangRepository.save(loHang);
    }

    private void truTonKho(String maCN, String maNL, double soLuong) {
        TonKho_ID tonKhoId = new TonKho_ID(maCN, maNL);
        TonKho tonKho = tonKhoRepository.findById(tonKhoId)
                .orElseThrow(() -> new IllegalArgumentException("Nguyen lieu chua co ton kho tai kho tong: " + maNL));
        double tonHienTai = valueOrZero(tonKho.getSoLuongTon());
        if (tonHienTai < soLuong) {
            throw new IllegalArgumentException("Kho tong khong du ton kho cho nguyen lieu " + maNL + ". Ton hien tai: " + tonHienTai);
        }
        tonKho.setSoLuongTon(tonHienTai - soLuong);
        tonKhoRepository.save(tonKho);
    }

    private String normalizeMaPN(String maPN) {
        if (!isBlank(maPN)) {
            return maPN.trim();
        }
        return "PN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String normalizeMaLo(String maLo) {
        if (!isBlank(maLo)) {
            return maLo.trim();
        }
        return "LO" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void congTonKho(String maCN, String maNL, double soLuong) {
        TonKho_ID tonKhoId = new TonKho_ID(maCN, maNL);
        TonKho tonKho = tonKhoRepository.findById(tonKhoId)
                .orElse(new TonKho(maCN, maNL, 0.0));
        double tonHienTai = tonKho.getSoLuongTon() != null ? tonKho.getSoLuongTon() : 0.0;
        tonKho.setSoLuongTon(tonHienTai + soLuong);
        tonKhoRepository.save(tonKho);
    }

    private void ghiGiaoDichNhapKho(String maPN, String maCN, String maNL, String maLo, double soLuong) {
        InventoryTransaction trans = new InventoryTransaction();
        trans.setMaTrans("TR_" + UUID.randomUUID().toString().substring(0, 8));
        trans.setMaCN(maCN);
        trans.setMaNL(maNL);
        trans.setMaLo(maLo);
        trans.setLoaiChungTu("PHIEUNHAP");
        trans.setIdChungTu(maPN);
        trans.setLoaiGiaoDich(1);
        trans.setSoLuong(soLuong);
        trans.setTrangThai(TRANG_THAI_HOP_LE);
        trans.setIsSynced(false);
        trans.setCreatedAt(LocalDateTime.now());
        inventoryTransactionRepository.save(trans);
    }

    private void ghiGiaoDichKhoTong(String maPN, String maCN, String maNL, String maLo, double soLuong) {
        InventoryTransaction trans = new InventoryTransaction();
        trans.setMaTrans("TR_" + UUID.randomUUID().toString().substring(0, 8));
        trans.setMaCN(maCN);
        trans.setMaNL(maNL);
        trans.setMaLo(maLo);
        trans.setLoaiChungTu("PHIEUNHAP");
        trans.setIdChungTu(maPN);
        trans.setLoaiGiaoDich(3);
        trans.setSoLuong(soLuong);
        trans.setTrangThai(TRANG_THAI_HOP_LE);
        trans.setIsSynced(false);
        trans.setCreatedAt(LocalDateTime.now());
        inventoryTransactionRepository.save(trans);
    }

    private PhieuNhapResponse toResponse(PhieuNhap phieuNhap) {
        List<CTPhieuNhap> chiTiet = ctPhieuNhapRepository.findByMaPN(phieuNhap.getMaPN());
        Map<String, LoHang> loHangMap = loHangRepository.findAllById(
                chiTiet.stream().map(CTPhieuNhap::getMaLo).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(LoHang::getMaLo, Function.identity()));

        List<CTPhieuNhapResponse> chiTietResponses = chiTiet.stream()
                .map(item -> {
                    LoHang loHang = loHangMap.get(item.getMaLo());
                    NguyenLieu nguyenLieu = loHang != null ? loHang.getNguyenLieu() : null;
                    return new CTPhieuNhapResponse(
                            item.getMaLo(),
                            nguyenLieu != null ? nguyenLieu.getMaNL() : null,
                            nguyenLieu != null ? nguyenLieu.getTenNL() : null,
                            toDouble(item.getSoLuong()),
                            toDouble(item.getDonGiaNhap()),
                            toDouble(item.getThanhTien()),
                            loHang != null ? loHang.getHanSuDung() : null
                    );
                })
                .collect(Collectors.toList());

        NhaCungCap nhaCungCap = phieuNhap.getNhaCungCap();
        ChiNhanh chiNhanh = phieuNhap.getChiNhanh();
        NhanVien nhanVien = phieuNhap.getNhanVien();
        String maKhoNguon = null;
        if (nhaCungCap == null) {
            maKhoNguon = inventoryTransactionRepository
                    .findByLoaiChungTuAndIdChungTu("PHIEUNHAP", phieuNhap.getMaPN())
                    .stream()
                    .filter(item -> Integer.valueOf(3).equals(item.getLoaiGiaoDich()))
                    .map(InventoryTransaction::getMaCN)
                    .filter(value -> !isBlank(value))
                    .findFirst()
                    .orElse(null);
        }

        return new PhieuNhapResponse(
                phieuNhap.getMaPN(),
                phieuNhap.getNhaCungCap() != null ? NGUON_NHA_CUNG_CAP : NGUON_KHO_TONG,
                maKhoNguon,
                nhaCungCap != null ? nhaCungCap.getMaNCC() : null,
                nhaCungCap != null ? nhaCungCap.getTenNCC() : null,
                chiNhanh != null ? chiNhanh.getMaCN() : null,
                chiNhanh != null ? chiNhanh.getTenCN() : null,
                nhanVien != null ? nhanVien.getMaNV() : null,
                nhanVien != null ? nhanVien.getTenNV() : null,
                phieuNhap.getNgayNhap(),
                toDouble(phieuNhap.getTongTien()),
                phieuNhap.getTrangThai(),
                chiTietResponses
        );
    }

    private String normalizeLoaiNguon(PhieuNhapRequest request) {
        if (!isBlank(request.getLoaiNguon())) {
            String value = request.getLoaiNguon().trim().toUpperCase();
            if (NGUON_NHA_CUNG_CAP.equals(value) || NGUON_KHO_TONG.equals(value)) {
                return value;
            }
            throw new IllegalArgumentException("Loai nguon nhap khong hop le");
        }
        return !isBlank(request.getMaKhoNguon()) ? NGUON_KHO_TONG : NGUON_NHA_CUNG_CAP;
    }

    private NguyenLieu getNguyenLieuFromLo(LoHang loHang) {
        if (loHang.getNguyenLieu() == null) {
            throw new IllegalArgumentException("Lo hang chua gan nguyen lieu: " + loHang.getMaLo());
        }
        return loHang.getNguyenLieu();
    }

    private BigDecimal toBigDecimal(double value) {
        return BigDecimal.valueOf(value);
    }

    private Double toDouble(BigDecimal value) {
        return value != null ? value.doubleValue() : null;
    }

    private double valueOrZero(Double value) {
        return value != null ? value : 0.0;
    }

    private double valueOrZero(BigDecimal value) {
        return value != null ? value.doubleValue() : 0.0;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
