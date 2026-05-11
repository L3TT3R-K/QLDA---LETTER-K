package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.CTPhieuXuatKhoRequest;
import com.phungloccoffee.backend.dto.CTPhieuXuatKhoResponse;
import com.phungloccoffee.backend.dto.HaoHutXuatKhoResponse;
import com.phungloccoffee.backend.dto.PhieuXuatKhoRequest;
import com.phungloccoffee.backend.dto.PhieuXuatKhoResponse;
import com.phungloccoffee.backend.entity.CTPhieuXuatKho;
import com.phungloccoffee.backend.entity.ChiNhanh;
import com.phungloccoffee.backend.entity.InventoryTransaction;
import com.phungloccoffee.backend.entity.LoHang;
import com.phungloccoffee.backend.entity.NguyenLieu;
import com.phungloccoffee.backend.entity.NhanVien;
import com.phungloccoffee.backend.entity.PhieuXuatKho;
import com.phungloccoffee.backend.entity.TonKho;
import com.phungloccoffee.backend.entity.TonKho_ID;
import com.phungloccoffee.backend.repository.CTPhieuXuatKhoRepository;
import com.phungloccoffee.backend.repository.ChiNhanhRepository;
import com.phungloccoffee.backend.repository.InventoryTransactionRepository;
import com.phungloccoffee.backend.repository.LoHangRepository;
import com.phungloccoffee.backend.repository.NguyenLieuRepository;
import com.phungloccoffee.backend.repository.NhanVienRepository;
import com.phungloccoffee.backend.repository.PhieuXuatKhoRepository;
import com.phungloccoffee.backend.repository.TonKhoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PhieuXuatKhoService {

    private static final String XUAT_SU_DUNG = "XUAT_SU_DUNG";
    private static final String HONG = "HONG";
    private static final String THAT_THOAT = "THAT_THOAT";
    private static final String HET_HAN = "HET_HAN";

    @Autowired private PhieuXuatKhoRepository phieuXuatKhoRepository;
    @Autowired private CTPhieuXuatKhoRepository ctPhieuXuatKhoRepository;
    @Autowired private ChiNhanhRepository chiNhanhRepository;
    @Autowired private NhanVienRepository nhanVienRepository;
    @Autowired private NguyenLieuRepository nguyenLieuRepository;
    @Autowired private LoHangRepository loHangRepository;
    @Autowired private TonKhoRepository tonKhoRepository;
    @Autowired private InventoryTransactionRepository inventoryTransactionRepository;

    @Transactional
    public PhieuXuatKhoResponse taoPhieuXuatKho(PhieuXuatKhoRequest request) {
        validateRequest(request);

        String maPX = normalizeMaPX(request.getMaPX());
        if (phieuXuatKhoRepository.existsById(maPX)) {
            throw new IllegalArgumentException("Ma phieu xuat da ton tai: " + maPX);
        }

        ChiNhanh chiNhanh = chiNhanhRepository.findById(request.getMaCN())
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay chi nhanh: " + request.getMaCN()));
        NhanVien nhanVien = nhanVienRepository.findById(request.getMaNV())
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay nhan vien: " + request.getMaNV()));

        PhieuXuatKho phieuXuatKho = new PhieuXuatKho();
        phieuXuatKho.setMaPX(maPX);
        phieuXuatKho.setChiNhanh(chiNhanh);
        phieuXuatKho.setNhanVien(nhanVien);
        phieuXuatKho.setLyDo(normalizeLyDo(request.getLyDo()));
        phieuXuatKho.setTrangThai(1);
        phieuXuatKho.setIsSynced(false);

        PhieuXuatKho savedPhieuXuatKho = phieuXuatKhoRepository.save(phieuXuatKho);

        for (CTPhieuXuatKhoRequest chiTietRequest : request.getChiTiet()) {
            LoHang loHang = loHangRepository.findById(chiTietRequest.getMaLo())
                    .orElseThrow(() -> new IllegalArgumentException("Khong tim thay lo hang: " + chiTietRequest.getMaLo()));
            NguyenLieu nguyenLieu = loHang.getNguyenLieu();
            if (nguyenLieu == null) {
                throw new IllegalArgumentException("Lo hang chua gan nguyen lieu: " + chiTietRequest.getMaLo());
            }
            if (loHang.getChiNhanh() == null || !chiNhanh.getMaCN().equals(loHang.getChiNhanh().getMaCN())) {
                throw new IllegalArgumentException("Lo hang khong thuoc chi nhanh xuat: " + chiTietRequest.getMaLo());
            }

            double soLuong = chiTietRequest.getSoLuong();
            String lyDo = savedPhieuXuatKho.getLyDo();

            truLoHang(loHang, soLuong);
            truTonKho(chiNhanh.getMaCN(), nguyenLieu.getMaNL(), soLuong);

            CTPhieuXuatKho chiTiet = new CTPhieuXuatKho();
            chiTiet.setMaPX(savedPhieuXuatKho.getMaPX());
            chiTiet.setMaLo(loHang.getMaLo());
            chiTiet.setSoLuong(toBigDecimal(soLuong));
            ctPhieuXuatKhoRepository.save(chiTiet);

            ghiGiaoDichXuatKho(savedPhieuXuatKho.getMaPX(), chiNhanh.getMaCN(), nguyenLieu.getMaNL(), loHang.getMaLo(), soLuong, lyDo);
        }

        return toResponse(savedPhieuXuatKho);
    }

    public List<PhieuXuatKhoResponse> getAll() {
        return phieuXuatKhoRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PhieuXuatKhoResponse getById(String maPX) {
        PhieuXuatKho phieuXuatKho = phieuXuatKhoRepository.findById(maPX)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay phieu xuat: " + maPX));
        return toResponse(phieuXuatKho);
    }

    public List<PhieuXuatKhoResponse> getByChiNhanh(String maCN) {
        return phieuXuatKhoRepository.findByChiNhanhMaCN(maCN).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<HaoHutXuatKhoResponse> thongKeHaoHut(String maCN, LocalDateTime tuNgay, LocalDateTime denNgay) {
        List<PhieuXuatKho> phieuXuatKhoList = phieuXuatKhoRepository.findByChiNhanhMaCNAndCreatedAtBetween(maCN, tuNgay, denNgay);
        Map<String, HaoHutXuatKhoResponse> resultMap = new LinkedHashMap<>();

        for (PhieuXuatKho phieuXuatKho : phieuXuatKhoList) {
            if (!isHaoHut(phieuXuatKho.getLyDo())) {
                continue;
            }
            for (CTPhieuXuatKho chiTiet : ctPhieuXuatKhoRepository.findByMaPX(phieuXuatKho.getMaPX())) {
                LoHang loHang = loHangRepository.findById(chiTiet.getMaLo()).orElse(null);
                NguyenLieu nguyenLieu = loHang != null ? loHang.getNguyenLieu() : null;
                String maNL = nguyenLieu != null ? nguyenLieu.getMaNL() : null;
                String key = chiTiet.getMaLo() + "|" + phieuXuatKho.getLyDo();
                HaoHutXuatKhoResponse item = resultMap.get(key);
                if (item == null) {
                    item = new HaoHutXuatKhoResponse(
                            maNL,
                            nguyenLieu != null ? nguyenLieu.getTenNL() : null,
                            phieuXuatKho.getLyDo(),
                            0.0
                    );
                    resultMap.put(key, item);
                }
                item.setTongSoLuong(item.getTongSoLuong() + valueOrZero(chiTiet.getSoLuong()));
            }
        }

        return new ArrayList<>(resultMap.values());
    }

    private void validateRequest(PhieuXuatKhoRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Du lieu phieu xuat khong duoc de trong");
        }
        if (isBlank(request.getMaCN())) {
            throw new IllegalArgumentException("Ma chi nhanh khong duoc de trong");
        }
        if (isBlank(request.getMaNV())) {
            throw new IllegalArgumentException("Ma nhan vien khong duoc de trong");
        }
        if (!isBlank(request.getLyDo()) && !isValidLyDo(request.getLyDo())) {
            throw new IllegalArgumentException("Loai xuat khong hop le");
        }
        if (request.getChiTiet() == null || request.getChiTiet().isEmpty()) {
            throw new IllegalArgumentException("Phieu xuat phai co it nhat mot dong chi tiet");
        }
        for (CTPhieuXuatKhoRequest chiTiet : request.getChiTiet()) {
            if (chiTiet == null || isBlank(chiTiet.getMaLo())) {
                throw new IllegalArgumentException("Ma lo khong duoc de trong");
            }
            if (chiTiet.getSoLuong() == null || chiTiet.getSoLuong() <= 0) {
                throw new IllegalArgumentException("So luong xuat phai lon hon 0");
            }
        }
    }

    private void truLoHang(LoHang loHang, double soLuong) {
        double soLuongCon = valueOrZero(loHang.getSoLuongCon());
        if (soLuongCon < soLuong) {
            throw new IllegalArgumentException("Khong du so luong trong lo " + loHang.getMaLo() + ". Con lai: " + soLuongCon);
        }
        loHang.setSoLuongCon(toBigDecimal(soLuongCon - soLuong));
        loHangRepository.save(loHang);
    }

    private void truTonKho(String maCN, String maNL, double soLuong) {
        TonKho_ID tonKhoId = new TonKho_ID(maCN, maNL);
        TonKho tonKho = tonKhoRepository.findById(tonKhoId)
                .orElseThrow(() -> new IllegalArgumentException("Nguyen lieu chua co ton kho: " + maNL));
        double tonHienTai = valueOrZero(tonKho.getSoLuongTon());
        if (tonHienTai < soLuong) {
            throw new IllegalArgumentException("Khong du ton kho cho nguyen lieu " + maNL + ". Ton hien tai: " + tonHienTai);
        }
        tonKho.setSoLuongTon(tonHienTai - soLuong);
        tonKhoRepository.save(tonKho);
    }

    private void ghiGiaoDichXuatKho(String maPX, String maCN, String maNL, String maLo, double soLuong, String lyDo) {
        InventoryTransaction trans = new InventoryTransaction();
        trans.setMaTrans("TR_" + UUID.randomUUID().toString().substring(0, 8));
        trans.setMaCN(maCN);
        trans.setMaNL(maNL);
        trans.setMaLo(maLo);
        trans.setLoaiChungTu("XUATKHO_" + lyDo);
        trans.setIdChungTu(maPX);
        trans.setLoaiGiaoDich(-1);
        trans.setSoLuong(-soLuong);
        trans.setTrangThai(1);
        trans.setIsSynced(false);
        trans.setCreatedAt(LocalDateTime.now());
        inventoryTransactionRepository.save(trans);
    }

    private PhieuXuatKhoResponse toResponse(PhieuXuatKho phieuXuatKho) {
        List<CTPhieuXuatKho> chiTiet = ctPhieuXuatKhoRepository.findByMaPX(phieuXuatKho.getMaPX());
        Map<String, LoHang> loHangMap = loHangRepository.findAllById(
                chiTiet.stream().map(CTPhieuXuatKho::getMaLo).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(LoHang::getMaLo, Function.identity()));

        List<CTPhieuXuatKhoResponse> chiTietResponses = chiTiet.stream()
                .map(item -> {
                    LoHang loHang = loHangMap.get(item.getMaLo());
                    NguyenLieu nguyenLieu = loHang != null ? loHang.getNguyenLieu() : null;
                    return new CTPhieuXuatKhoResponse(
                            item.getMaLo(),
                            nguyenLieu != null ? nguyenLieu.getMaNL() : null,
                            nguyenLieu != null ? nguyenLieu.getTenNL() : null,
                            toDouble(item.getSoLuong()),
                            loHang != null ? loHang.getHanSuDung() : null
                    );
                })
                .collect(Collectors.toList());

        ChiNhanh chiNhanh = phieuXuatKho.getChiNhanh();
        NhanVien nhanVien = phieuXuatKho.getNhanVien();

        return new PhieuXuatKhoResponse(
                phieuXuatKho.getMaPX(),
                chiNhanh != null ? chiNhanh.getMaCN() : null,
                chiNhanh != null ? chiNhanh.getTenCN() : null,
                nhanVien != null ? nhanVien.getMaNV() : null,
                nhanVien != null ? nhanVien.getTenNV() : null,
                phieuXuatKho.getCreatedAt(),
                phieuXuatKho.getLyDo(),
                phieuXuatKho.getTrangThai(),
                chiTietResponses
        );
    }

    private String normalizeMaPX(String maPX) {
        if (!isBlank(maPX)) {
            return maPX.trim();
        }
        return "PX" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String normalizeLyDo(String lyDo) {
        return isBlank(lyDo) ? XUAT_SU_DUNG : lyDo.trim().toUpperCase();
    }

    private boolean isValidLyDo(String lyDo) {
        String value = normalizeLyDo(lyDo);
        return XUAT_SU_DUNG.equals(value) || HONG.equals(value) || THAT_THOAT.equals(value) || HET_HAN.equals(value);
    }

    private boolean isHaoHut(String lyDo) {
        String value = normalizeLyDo(lyDo);
        return HONG.equals(value) || THAT_THOAT.equals(value) || HET_HAN.equals(value);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private double valueOrZero(Double value) {
        return value != null ? value : 0.0;
    }

    private double valueOrZero(BigDecimal value) {
        return value != null ? value.doubleValue() : 0.0;
    }

    private BigDecimal toBigDecimal(double value) {
        return BigDecimal.valueOf(value);
    }

    private Double toDouble(BigDecimal value) {
        return value != null ? value.doubleValue() : null;
    }
}
