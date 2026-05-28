package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.ChiTietDinhMucDTO;
import com.phungloccoffee.backend.dto.CongThucRequest;
import com.phungloccoffee.backend.dto.CongThucResponse;
import com.phungloccoffee.backend.entity.DinhMucCongThuc;
import com.phungloccoffee.backend.entity.DinhMucCongThucId;
import com.phungloccoffee.backend.entity.PhienBanCongThuc;
import com.phungloccoffee.backend.entity.SanPham;
import com.phungloccoffee.backend.repository.DinhMucCongThucRepository;
import com.phungloccoffee.backend.repository.NguyenLieuRepository;
import com.phungloccoffee.backend.repository.PhienBanCongThucRepository;
import com.phungloccoffee.backend.repository.SanPhamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CongThucService {

    private final PhienBanCongThucRepository phienBanRepo;
    private final DinhMucCongThucRepository dinhMucRepo;
    private final SanPhamRepository sanPhamRepo;
    private final NguyenLieuRepository nguyenLieuRepo;

    public CongThucResponse getCongThuc(String maSP) {
        SanPham sp = sanPhamRepo.findById(maSP)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        Optional<PhienBanCongThuc> phienBanOpt = phienBanRepo.findByMaSPAndTrangThai(maSP, 1);
        
        if (phienBanOpt.isEmpty()) {
            return CongThucResponse.builder().maSP(maSP).tenSP(sp.getTenSP()).chiTiet(new ArrayList<>()).build();
        }

        PhienBanCongThuc pb = phienBanOpt.get();
        List<Object[]> rows = dinhMucRepo.findChiTietByMaPB(pb.getMaPB());
        List<ChiTietDinhMucDTO> chiTietList = new ArrayList<>();

        for (Object[] row : rows) {
            chiTietList.add(ChiTietDinhMucDTO.builder()
                    .maNL((String) row[0])
                    .tenNL((String) row[1])
                    .donViCoBan((String) row[2])
                    .soLuong((BigDecimal) row[3])
                    .build());
        }

        return CongThucResponse.builder()
                .maPB(pb.getMaPB())
                .maSP(maSP)
                .tenSP(sp.getTenSP())
                .chiTiet(chiTietList)
                .build();
    }

    @Transactional
    public void saveCongThuc(CongThucRequest request) {
        validateRequest(request);

        List<PhienBanCongThuc> phienBanCu = phienBanRepo.findAllByMaSPAndTrangThai(request.getMaSP(), 1);
        for (PhienBanCongThuc pbCu : phienBanCu) {
            pbCu.setTrangThai(0);
        }
        phienBanRepo.saveAll(phienBanCu);

        PhienBanCongThuc pbMoi = new PhienBanCongThuc();
        pbMoi.setMaPB("PB" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        pbMoi.setMaSP(request.getMaSP());
        pbMoi.setNgayHieuLuc(LocalDateTime.now());
        pbMoi.setTrangThai(1);
        phienBanRepo.save(pbMoi);

        for (ChiTietDinhMucDTO dto : request.getChiTiet()) {
            DinhMucCongThucId id = new DinhMucCongThucId(pbMoi.getMaPB(), dto.getMaNL());
            DinhMucCongThuc dm = new DinhMucCongThuc();
            dm.setId(id);
            dm.setSoLuong(dto.getSoLuong());
            dinhMucRepo.save(dm);
        }
    }

    private void validateRequest(CongThucRequest request) {
        if (request == null) {
            throw new RuntimeException("Du lieu cong thuc khong hop le");
        }

        if (request.getMaSP() == null || request.getMaSP().isBlank()) {
            throw new RuntimeException("Ma san pham khong duoc de trong");
        }

        if (!sanPhamRepo.existsById(request.getMaSP())) {
            throw new RuntimeException("San pham khong ton tai: " + request.getMaSP());
        }

        if (request.getChiTiet() == null || request.getChiTiet().isEmpty()) {
            throw new RuntimeException("Cong thuc phai co it nhat mot nguyen lieu");
        }

        List<String> maNguyenLieuDaCo = new ArrayList<>();
        for (ChiTietDinhMucDTO item : request.getChiTiet()) {
            if (item == null || item.getMaNL() == null || item.getMaNL().isBlank()) {
                throw new RuntimeException("Ma nguyen lieu khong duoc de trong");
            }

            if (item.getSoLuong() == null || item.getSoLuong().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("So luong nguyen lieu phai lon hon 0");
            }

            if (maNguyenLieuDaCo.contains(item.getMaNL())) {
                throw new RuntimeException("Nguyen lieu bi trung trong cong thuc: " + item.getMaNL());
            }

            if (!nguyenLieuRepo.existsById(item.getMaNL())) {
                throw new RuntimeException("Nguyen lieu khong ton tai: " + item.getMaNL());
            }

            maNguyenLieuDaCo.add(item.getMaNL());
        }
    }
}
