package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.CTPhieuDieuChuyenKhoRequest;
import com.phungloccoffee.backend.dto.CTPhieuDieuChuyenKhoResponse;
import com.phungloccoffee.backend.dto.CapNhatTrangThaiDieuChuyenRequest;
import com.phungloccoffee.backend.dto.PhieuDieuChuyenKhoRequest;
import com.phungloccoffee.backend.dto.PhieuDieuChuyenKhoResponse;
import com.phungloccoffee.backend.entity.CTPhieuDieuChuyenKho;
import com.phungloccoffee.backend.entity.CTPhieuDieuChuyenKhoId;
import com.phungloccoffee.backend.entity.ChiNhanh;
import com.phungloccoffee.backend.entity.InventoryTransaction;
import com.phungloccoffee.backend.entity.LoHang;
import com.phungloccoffee.backend.entity.NguyenLieu;
import com.phungloccoffee.backend.entity.NhanVien;
import com.phungloccoffee.backend.entity.PhieuDieuChuyenKho;
import com.phungloccoffee.backend.entity.TonKho;
import com.phungloccoffee.backend.entity.TonKho_ID;
import com.phungloccoffee.backend.repository.CTPhieuDieuChuyenKhoRepository;
import com.phungloccoffee.backend.repository.ChiNhanhRepository;
import com.phungloccoffee.backend.repository.InventoryTransactionRepository;
import com.phungloccoffee.backend.repository.LoHangRepository;
import com.phungloccoffee.backend.repository.NhanVienRepository;
import com.phungloccoffee.backend.repository.PhieuDieuChuyenKhoRepository;
import com.phungloccoffee.backend.repository.TonKhoRepository;
import com.phungloccoffee.backend.utils.SecurityUtils;
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
public class PhieuDieuChuyenKhoService {

    private static final Integer TAO_PHIEU = 0;
    private static final Integer DANG_CHUYEN = 1;
    private static final Integer DA_NHAN = 2;
    private static final Integer DA_HUY = 3;
    private static final Integer TRANG_THAI_HOP_LE = 1;

    @Autowired private PhieuDieuChuyenKhoRepository phieuDieuChuyenKhoRepository;
    @Autowired private CTPhieuDieuChuyenKhoRepository ctPhieuDieuChuyenKhoRepository;
    @Autowired private ChiNhanhRepository chiNhanhRepository;
    @Autowired private NhanVienRepository nhanVienRepository;
    @Autowired private LoHangRepository loHangRepository;
    @Autowired private TonKhoRepository tonKhoRepository;
    @Autowired private InventoryTransactionRepository inventoryTransactionRepository;

    @Transactional
    public PhieuDieuChuyenKhoResponse taoPhieuDieuChuyen(PhieuDieuChuyenKhoRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Du lieu phieu chuyen khong duoc de trong");
        }
        request.setMaNVTao(getCurrentNhanVien().getMaNV());
        validateCreateRequest(request);

        String maPC = normalizeMaPC(request.getMaPC());
        if (phieuDieuChuyenKhoRepository.existsById(maPC)) {
            throw new IllegalArgumentException("Ma phieu chuyen da ton tai: " + maPC);
        }

        ChiNhanh chiNhanhXuat = chiNhanhRepository.findById(request.getMaCNXuat())
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay chi nhanh xuat: " + request.getMaCNXuat()));
        chiNhanhRepository.findById(request.getMaCNNhap())
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay chi nhanh nhap: " + request.getMaCNNhap()));
        NhanVien nhanVien = getCurrentNhanVien();

        PhieuDieuChuyenKho phieu = new PhieuDieuChuyenKho();
        phieu.setMaPC(maPC);
        phieu.setMaCNXuat(request.getMaCNXuat().trim());
        phieu.setMaCNNhap(request.getMaCNNhap().trim());
        phieu.setNhanVien(nhanVien);
        phieu.setTrangThai(TAO_PHIEU);
        phieu.setIsSynced(false);

        PhieuDieuChuyenKho savedPhieu = phieuDieuChuyenKhoRepository.save(phieu);

        for (CTPhieuDieuChuyenKhoRequest chiTietRequest : request.getChiTiet()) {
            taoChiTietChuyen(savedPhieu, chiNhanhXuat, chiTietRequest);
        }

        return toResponse(savedPhieu);
    }

    @Transactional
    public PhieuDieuChuyenKhoResponse guiPhieu(String maPC, CapNhatTrangThaiDieuChuyenRequest request) {
        PhieuDieuChuyenKho phieu = getPhieuOrThrow(maPC);
        if (!TAO_PHIEU.equals(parseTrangThai(phieu.getTrangThai()))) {
            throw new IllegalArgumentException("Chi co phieu Tao phieu moi duoc gui");
        }
        for (CTPhieuDieuChuyenKho chiTiet : ctPhieuDieuChuyenKhoRepository.findByMaPC(phieu.getMaPC())) {
            LoHang loHang = loHangRepository.findById(chiTiet.getMaLo())
                    .orElseThrow(() -> new IllegalArgumentException("Khong tim thay lo hang: " + chiTiet.getMaLo()));
            NguyenLieu nguyenLieu = getNguyenLieuFromLo(loHang);
            double soLuong = valueOrZero(chiTiet.getSoLuong());
            truLoHang(loHang, soLuong);
            truTonKho(phieu.getMaCNXuat(), nguyenLieu.getMaNL(), soLuong);
            ghiGiaoDich(phieu.getMaPC(), phieu.getMaCNXuat(), nguyenLieu.getMaNL(), loHang.getMaLo(), soLuong, 3);
        }

        phieu.setTrangThai(DANG_CHUYEN);
        return toResponse(phieuDieuChuyenKhoRepository.save(phieu));
    }

    @Transactional
    public PhieuDieuChuyenKhoResponse nhanPhieu(String maPC, CapNhatTrangThaiDieuChuyenRequest request) {
        PhieuDieuChuyenKho phieu = getPhieuOrThrow(maPC);
        if (!DANG_CHUYEN.equals(parseTrangThai(phieu.getTrangThai()))) {
            throw new IllegalArgumentException("Chi co phieu Dang chuyen moi duoc nhan");
        }
        ChiNhanh chiNhanhNhan = chiNhanhRepository.findById(phieu.getMaCNNhap())
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay chi nhanh nhap: " + phieu.getMaCNNhap()));
        for (CTPhieuDieuChuyenKho chiTiet : ctPhieuDieuChuyenKhoRepository.findByMaPC(phieu.getMaPC())) {
            LoHang loXuat = loHangRepository.findById(chiTiet.getMaLo())
                    .orElseThrow(() -> new IllegalArgumentException("Khong tim thay lo hang: " + chiTiet.getMaLo()));
            NguyenLieu nguyenLieu = getNguyenLieuFromLo(loXuat);
            double soLuong = valueOrZero(chiTiet.getSoLuong());
            LoHang loNhan = taoLoNhan(phieu, loXuat, chiNhanhNhan, soLuong);
            congTonKho(phieu.getMaCNNhap(), nguyenLieu.getMaNL(), soLuong);
            ghiGiaoDich(phieu.getMaPC(), phieu.getMaCNNhap(), nguyenLieu.getMaNL(), loNhan.getMaLo(), soLuong, 4);
        }

        phieu.setTrangThai(DA_NHAN);
        return toResponse(phieuDieuChuyenKhoRepository.save(phieu));
    }

    @Transactional
    public PhieuDieuChuyenKhoResponse huyPhieu(String maPC, CapNhatTrangThaiDieuChuyenRequest request) {
        PhieuDieuChuyenKho phieu = getPhieuOrThrow(maPC);
        if (!TAO_PHIEU.equals(parseTrangThai(phieu.getTrangThai()))) {
            throw new IllegalArgumentException("Chi co phieu Tao phieu moi duoc huy");
        }
        phieu.setTrangThai(DA_HUY);
        return toResponse(phieuDieuChuyenKhoRepository.save(phieu));
    }

    public List<PhieuDieuChuyenKhoResponse> getAll() {
        return phieuDieuChuyenKhoRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PhieuDieuChuyenKhoResponse getById(String maPC) {
        return toResponse(getPhieuOrThrow(maPC));
    }

    public List<PhieuDieuChuyenKhoResponse> getByKho(String maKho) {
        return phieuDieuChuyenKhoRepository.findByMaCNXuatOrMaCNNhap(maKho, maKho).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PhieuDieuChuyenKhoResponse> getByTrangThai(String trangThai) {
        return phieuDieuChuyenKhoRepository.findByTrangThai(parseTrangThai(trangThai)).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private void validateCreateRequest(PhieuDieuChuyenKhoRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Du lieu phieu chuyen khong duoc de trong");
        }
        if (isBlank(request.getMaCNXuat())) {
            throw new IllegalArgumentException("Ma chi nhanh xuat khong duoc de trong");
        }
        if (isBlank(request.getMaCNNhap())) {
            throw new IllegalArgumentException("Ma chi nhanh nhap khong duoc de trong");
        }
        if (request.getMaCNXuat().trim().equals(request.getMaCNNhap().trim())) {
            throw new IllegalArgumentException("Chi nhanh xuat va nhap phai khac nhau");
        }
        if (isBlank(request.getMaNVTao())) {
            throw new IllegalArgumentException("Ma nhan vien tao khong duoc de trong");
        }
        if (request.getChiTiet() == null || request.getChiTiet().isEmpty()) {
            throw new IllegalArgumentException("Phieu chuyen phai co it nhat mot dong chi tiet");
        }
        for (CTPhieuDieuChuyenKhoRequest chiTiet : request.getChiTiet()) {
            if (chiTiet == null || (isBlank(chiTiet.getMaLo()) && isBlank(chiTiet.getMaNL()))) {
                throw new IllegalArgumentException("Chi tiet chuyen phai co ma lo hoac ma nguyen lieu");
            }
            if (chiTiet.getSoLuong() == null || chiTiet.getSoLuong() <= 0) {
                throw new IllegalArgumentException("So luong chuyen phai lon hon 0");
            }
        }
    }

    private void taoChiTietChuyen(PhieuDieuChuyenKho phieu, ChiNhanh chiNhanhXuat, CTPhieuDieuChuyenKhoRequest chiTietRequest) {
        if (!isBlank(chiTietRequest.getMaLo())) {
            LoHang loHang = loHangRepository.findById(chiTietRequest.getMaLo().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Khong tim thay lo hang: " + chiTietRequest.getMaLo()));
            validateLoXuat(loHang, chiNhanhXuat.getMaCN());
            if (!isBlank(chiTietRequest.getMaNL()) && !chiTietRequest.getMaNL().trim().equals(getNguyenLieuFromLo(loHang).getMaNL())) {
                throw new IllegalArgumentException("Lo hang khong dung nguyen lieu can chuyen: " + loHang.getMaLo());
            }
            if (valueOrZero(loHang.getSoLuongCon()) < chiTietRequest.getSoLuong()) {
                throw new IllegalArgumentException("Khong du so luong trong lo " + loHang.getMaLo());
            }
            luuChiTiet(phieu.getMaPC(), loHang.getMaLo(), chiTietRequest.getSoLuong());
            return;
        }

        double soLuongCanChuyen = chiTietRequest.getSoLuong();
        List<LoHang> loHangList = new ArrayList<>(loHangRepository.findByNguyenLieuMaNLAndChiNhanhMaCN(
                chiTietRequest.getMaNL().trim(), chiNhanhXuat.getMaCN()));
        loHangList.sort(Comparator
                .comparing(LoHang::getHanSuDung, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(LoHang::getNgayNhap, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(LoHang::getMaLo));

        for (LoHang loHang : loHangList) {
            if (soLuongCanChuyen <= 0) {
                break;
            }
            double soLuongLo = valueOrZero(loHang.getSoLuongCon());
            double soLuongChuyen = Math.min(soLuongLo, soLuongCanChuyen);
            if (soLuongChuyen <= 0) {
                continue;
            }
            luuChiTiet(phieu.getMaPC(), loHang.getMaLo(), soLuongChuyen);
            soLuongCanChuyen -= soLuongChuyen;
        }

        if (soLuongCanChuyen > 0) {
            throw new IllegalArgumentException("Khong du ton kho de chuyen nguyen lieu " + chiTietRequest.getMaNL());
        }
    }

    private void validateLoXuat(LoHang loHang, String maCNXuat) {
        if (loHang.getChiNhanh() == null || !maCNXuat.equals(loHang.getChiNhanh().getMaCN())) {
            throw new IllegalArgumentException("Lo hang khong thuoc kho xuat: " + loHang.getMaLo());
        }
    }

    private void luuChiTiet(String maPC, String maLo, double soLuong) {
        CTPhieuDieuChuyenKhoId id = new CTPhieuDieuChuyenKhoId(maPC, maLo);
        CTPhieuDieuChuyenKho chiTiet = ctPhieuDieuChuyenKhoRepository.findById(id).orElseGet(CTPhieuDieuChuyenKho::new);
        chiTiet.setMaPC(maPC);
        chiTiet.setMaLo(maLo);
        chiTiet.setSoLuong(toBigDecimal(valueOrZero(chiTiet.getSoLuong()) + soLuong));
        ctPhieuDieuChuyenKhoRepository.save(chiTiet);
    }

    private void truLoHang(LoHang loHang, double soLuong) {
        double soLuongCon = valueOrZero(loHang.getSoLuongCon());
        if (soLuongCon < soLuong) {
            throw new IllegalArgumentException("Khong du so luong trong lo " + loHang.getMaLo() + ". Con lai: " + soLuongCon);
        }
        loHang.setSoLuongCon(toBigDecimal(soLuongCon - soLuong));
        loHangRepository.save(loHang);
    }

    private LoHang taoLoNhan(PhieuDieuChuyenKho phieu, LoHang loXuat, ChiNhanh chiNhanhNhan, double soLuong) {
        LoHang loNhan = new LoHang();
        loNhan.setMaLo(generateMaLo());
        loNhan.setNguyenLieu(getNguyenLieuFromLo(loXuat));
        loNhan.setChiNhanh(chiNhanhNhan);
        loNhan.setNgayNhap(LocalDateTime.now());
        loNhan.setHanSuDung(loXuat.getHanSuDung());
        loNhan.setSoLuongCon(toBigDecimal(soLuong));
        loNhan.setIsSynced(false);
        return loHangRepository.save(loNhan);
    }

    private void truTonKho(String maCN, String maNL, double soLuong) {
        TonKho_ID tonKhoId = new TonKho_ID(maCN, maNL);
        TonKho tonKho = tonKhoRepository.findById(tonKhoId)
                .orElseThrow(() -> new IllegalArgumentException("Nguyen lieu chua co ton kho tai chi nhanh xuat: " + maNL));
        double tonHienTai = valueOrZero(tonKho.getSoLuongTon());
        if (tonHienTai < soLuong) {
            throw new IllegalArgumentException("Khong du ton kho tai chi nhanh xuat cho nguyen lieu " + maNL + ". Ton hien tai: " + tonHienTai);
        }
        tonKho.setSoLuongTon(tonHienTai - soLuong);
        tonKhoRepository.save(tonKho);
    }

    private void congTonKho(String maCN, String maNL, double soLuong) {
        TonKho_ID tonKhoId = new TonKho_ID(maCN, maNL);
        TonKho tonKho = tonKhoRepository.findById(tonKhoId)
                .orElse(new TonKho(maCN, maNL, 0.0));
        tonKho.setSoLuongTon(valueOrZero(tonKho.getSoLuongTon()) + soLuong);
        tonKhoRepository.save(tonKho);
    }

    private void ghiGiaoDich(String maPC, String maCN, String maNL, String maLo, double soLuong, Integer loaiGiaoDich) {
        InventoryTransaction trans = new InventoryTransaction();
        trans.setMaTrans("TR_" + UUID.randomUUID().toString().substring(0, 8));
        trans.setMaCN(maCN);
        trans.setMaNL(maNL);
        trans.setMaLo(maLo);
        trans.setLoaiChungTu("PHIEUCHUYEN");
        trans.setIdChungTu(maPC);
        trans.setLoaiGiaoDich(loaiGiaoDich);
        trans.setSoLuong(soLuong);
        trans.setTrangThai(TRANG_THAI_HOP_LE);
        trans.setIsSynced(false);
        trans.setCreatedAt(LocalDateTime.now());
        inventoryTransactionRepository.save(trans);
    }

    private PhieuDieuChuyenKhoResponse toResponse(PhieuDieuChuyenKho phieu) {
        List<CTPhieuDieuChuyenKho> chiTietList = ctPhieuDieuChuyenKhoRepository.findByMaPC(phieu.getMaPC());
        Map<String, LoHang> loHangMap = loHangRepository.findAllById(
                chiTietList.stream().map(CTPhieuDieuChuyenKho::getMaLo).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(LoHang::getMaLo, Function.identity()));

        List<CTPhieuDieuChuyenKhoResponse> chiTietResponses = chiTietList.stream()
                .map(item -> {
                    LoHang loHang = loHangMap.get(item.getMaLo());
                    NguyenLieu nguyenLieu = loHang != null ? loHang.getNguyenLieu() : null;
                    return new CTPhieuDieuChuyenKhoResponse(
                            item.getMaLo(),
                            nguyenLieu != null ? nguyenLieu.getMaNL() : null,
                            nguyenLieu != null ? nguyenLieu.getTenNL() : null,
                            toDouble(item.getSoLuong()),
                            loHang != null ? loHang.getHanSuDung() : null
                    );
                })
                .collect(Collectors.toList());

        NhanVien nhanVien = phieu.getNhanVien();
        return new PhieuDieuChuyenKhoResponse(
                phieu.getMaPC(),
                phieu.getMaCNXuat(),
                phieu.getMaCNNhap(),
                nhanVien != null ? nhanVien.getMaNV() : null,
                nhanVien != null ? nhanVien.getTenNV() : null,
                phieu.getCreatedAt(),
                phieu.getTrangThai(),
                chiTietResponses
        );
    }

    private PhieuDieuChuyenKho getPhieuOrThrow(String maPC) {
        return phieuDieuChuyenKhoRepository.findById(maPC)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay phieu chuyen: " + maPC));
    }

    private NguyenLieu getNguyenLieuFromLo(LoHang loHang) {
        if (loHang.getNguyenLieu() == null) {
            throw new IllegalArgumentException("Lo hang chua gan nguyen lieu: " + loHang.getMaLo());
        }
        return loHang.getNguyenLieu();
    }

    private String normalizeMaPC(String maPC) {
        if (!isBlank(maPC)) {
            return maPC.trim();
        }
        return "PC" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateMaLo() {
        String maLo;
        do {
            maLo = "LO" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (loHangRepository.existsById(maLo));
        return maLo;
    }

    private Integer parseTrangThai(Integer trangThai) {
        return trangThai;
    }

    private NhanVien getCurrentNhanVien() {
        String username = SecurityUtils.requireCurrentUsername();
        return nhanVienRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay nhan vien dang nhap: " + username));
    }

    private Integer parseTrangThai(String trangThai) {
        String value = trangThai.trim();
        String upper = value.toUpperCase();
        if ("CHO_GUI".equals(upper) || "DRAFT".equals(upper) || "0".equals(upper) || "TAO_PHIEU".equals(upper)
                || "TAO PHIEU".equals(upper) || upper.contains("PHI")) return TAO_PHIEU;
        if ("DA_GUI".equals(upper) || "SENT".equals(upper) || "1".equals(upper) || "DANG_CHUYEN".equals(upper)
                || "DANG CHUYEN".equals(upper) || upper.contains("CHUYEN")) return DANG_CHUYEN;
        if ("DA_NHAN".equals(upper) || "RECEIVED".equals(upper) || "COMPLETED".equals(upper) || "DONE".equals(upper)
                || "2".equals(upper) || "HOAN_THANH".equals(upper) || "DA NHAN".equals(upper)
                || upper.contains("NHAN") || upper.contains("THANH")) return DA_NHAN;
        if ("DA_HUY".equals(upper) || "CANCELLED".equals(upper) || "3".equals(upper) || "HUY".equals(upper)
                || upper.contains("HUY")) return DA_HUY;
        throw new IllegalArgumentException("Trang thai phieu chuyen khong hop le: " + trangThai);
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

    private BigDecimal toBigDecimal(Double value) {
        return value != null ? BigDecimal.valueOf(value) : null;
    }

    private BigDecimal toBigDecimal(double value) {
        return BigDecimal.valueOf(value);
    }

    private Double toDouble(BigDecimal value) {
        return value != null ? value.doubleValue() : null;
    }
}
