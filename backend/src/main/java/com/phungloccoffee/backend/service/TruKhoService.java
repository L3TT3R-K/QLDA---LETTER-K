package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.entity.*;
import com.phungloccoffee.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TruKhoService {

    private final HoaDonRepository hoaDonRepository;
    private final CTHDRepository cthdRepository;
    private final PhienBanCongThucService phienBanCongThucService;
    private final DinhMucCongThucRepository dinhMucCongThucRepository; 
    private final TonKhoRepository tonKhoRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public void truNguyenLieuTheoHoaDon(String maHD) {
        HoaDon hoaDon = hoaDonRepository.findById(maHD)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn: " + maHD));
        
        String maCN = hoaDon.getChiNhanh().getMaCN();
        List<CTHD> danhSachMon = cthdRepository.findByHoaDon(hoaDon);

        for (CTHD cthd : danhSachMon) {
            SanPham sanPham = cthd.getSanPham();
            int soLuongLy = cthd.getSoLuong();

            try {
                PhienBanCongThuc congThuc = phienBanCongThucService.getActiveByMaSP(sanPham.getMaSP());
                
                List<DinhMucCongThuc> dinhMucs = dinhMucCongThucRepository.findByIdMaPB(congThuc.getMaPB());

                for (DinhMucCongThuc dm : dinhMucs) {
                    String maNL = dm.getId().getMaNL();

                    double soLuongCanTru = dm.getSoLuong().multiply(java.math.BigDecimal.valueOf(soLuongLy)).doubleValue();

                    TonKho_ID tkId = new TonKho_ID(maCN, maNL);
                    TonKho tonKho = tonKhoRepository.findById(tkId)
                            .orElseThrow(() -> new RuntimeException("Nguyên liệu " + maNL + " chưa được khởi tạo kho tại chi nhánh " + maCN));

                    double tonCu = tonKho.getSoLuongTon();
                    tonKho.setSoLuongTon(tonCu - soLuongCanTru);
                    
                    tonKhoRepository.save(tonKho);
                }
            } catch (Exception e) {
                System.err.println("⚠️ [CẢNH BÁO] Không thể trừ kho cho sản phẩm " + sanPham.getTenSP() + ": " + e.getMessage());
                auditLogService.ghiLog("SYSTEM", "TONKHO", maHD, "LỖI TRỪ KHO", null, "Sản phẩm: " + sanPham.getTenSP() + " - Lỗi: " + e.getMessage());
            }
        }
    }
}