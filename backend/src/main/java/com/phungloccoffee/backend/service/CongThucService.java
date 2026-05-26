package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.ChiTietDinhMucDTO;
import com.phungloccoffee.backend.dto.CongThucRequest;
import com.phungloccoffee.backend.dto.CongThucResponse;
import com.phungloccoffee.backend.entity.DinhMucCongThuc;
import com.phungloccoffee.backend.entity.DinhMucCongThucId;
import com.phungloccoffee.backend.entity.PhienBanCongThuc;
import com.phungloccoffee.backend.entity.SanPham;
import com.phungloccoffee.backend.repository.DinhMucCongThucRepository;
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
        phienBanRepo.findByMaSPAndTrangThai(request.getMaSP(), 1).ifPresent(pbCu -> {
            pbCu.setTrangThai(0);
            phienBanRepo.save(pbCu);
        });

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
}