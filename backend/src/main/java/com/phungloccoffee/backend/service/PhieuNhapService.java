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
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PhieuNhapService {

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

        NhaCungCap nhaCungCap = nhaCungCapRepository.findById(request.getMaNCC())
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay nha cung cap: " + request.getMaNCC()));
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
        phieuNhap.setTrangThai(1);
        phieuNhap.setIsSynced(false);

        double tongTien = 0.0;
        PhieuNhap savedPhieuNhap = phieuNhapRepository.save(phieuNhap);

        for (CTPhieuNhapRequest chiTietRequest : request.getChiTiet()) {
            NguyenLieu nguyenLieu = nguyenLieuRepository.findById(chiTietRequest.getMaNL())
                    .orElseThrow(() -> new IllegalArgumentException("Khong tim thay nguyen lieu: " + chiTietRequest.getMaNL()));

            String maLo = normalizeMaLo(chiTietRequest.getMaLo());
            if (loHangRepository.existsById(maLo)) {
                throw new IllegalArgumentException("Ma lo da ton tai: " + maLo);
            }

            double soLuong = chiTietRequest.getSoLuong();
            double donGia = chiTietRequest.getDonGiaNhap() != null ? chiTietRequest.getDonGiaNhap() : 0.0;
            double thanhTien = soLuong * donGia;
            tongTien += thanhTien;

            LoHang loHang = new LoHang();
            loHang.setMaLo(maLo);
            loHang.setNguyenLieu(nguyenLieu);
            loHang.setChiNhanh(chiNhanh);
            loHang.setNgayNhap(savedPhieuNhap.getNgayNhap());
            loHang.setHanSuDung(chiTietRequest.getHanSuDung());
            loHang.setSoLuongCon(toBigDecimal(soLuong));
            loHang.setIsSynced(false);
            loHangRepository.save(loHang);

            CTPhieuNhap chiTiet = new CTPhieuNhap();
            chiTiet.setMaPN(savedPhieuNhap.getMaPN());
            chiTiet.setMaLo(maLo);
            chiTiet.setSoLuong(toBigDecimal(soLuong));
            chiTiet.setDonGiaNhap(toBigDecimal(donGia));
            chiTiet.setThanhTien(toBigDecimal(thanhTien));
            ctPhieuNhapRepository.save(chiTiet);

            congTonKho(chiNhanh.getMaCN(), nguyenLieu.getMaNL(), soLuong);
            ghiGiaoDichNhapKho(savedPhieuNhap.getMaPN(), chiNhanh.getMaCN(), nguyenLieu.getMaNL(), maLo, soLuong);
        }

        savedPhieuNhap.setTongTien(toBigDecimal(tongTien));
        return toResponse(phieuNhapRepository.save(savedPhieuNhap));
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

    private void validateRequest(PhieuNhapRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Du lieu phieu nhap khong duoc de trong");
        }
        if (isBlank(request.getMaNCC())) {
            throw new IllegalArgumentException("Ma nha cung cap khong duoc de trong");
        }
        if (isBlank(request.getMaCN())) {
            throw new IllegalArgumentException("Ma chi nhanh khong duoc de trong");
        }
        if (isBlank(request.getMaNV())) {
            throw new IllegalArgumentException("Ma nhan vien khong duoc de trong");
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
        trans.setLoaiChungTu("NHAPKHO");
        trans.setIdChungTu(maPN);
        trans.setLoaiGiaoDich(1);
        trans.setSoLuong(soLuong);
        trans.setTrangThai(1);
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

        return new PhieuNhapResponse(
                phieuNhap.getMaPN(),
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

    private BigDecimal toBigDecimal(double value) {
        return BigDecimal.valueOf(value);
    }

    private Double toDouble(BigDecimal value) {
        return value != null ? value.doubleValue() : null;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
