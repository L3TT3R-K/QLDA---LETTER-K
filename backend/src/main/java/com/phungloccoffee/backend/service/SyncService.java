package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.SyncDataRequest;
import com.phungloccoffee.backend.entity.*;
import com.phungloccoffee.backend.repository.*;
import com.phungloccoffee.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class SyncService {

    private final HoaDonRepository hoaDonRepository;
    private final CTHDRepository cthdRepository;
    private final SanPhamRepository sanPhamRepository;
    private final ChiNhanhRepository chiNhanhRepository;
    private final TruKhoService truKhoService; 
    private final AuditLogService auditLogService;

    @Transactional
    public int xuLyDongBo(SyncDataRequest request) {
        if (request.getDanhSachHoaDon() == null || request.getDanhSachHoaDon().isEmpty()) {
            return 0;
        }

        String tokenBranch = SecurityUtils.getCurrentUserBranch();
        boolean isAdmin = SecurityUtils.canAccessAllBranches();

        int successCount = 0;

        for (SyncDataRequest.HoaDonSyncDto hdDto : request.getDanhSachHoaDon()) {
            if (hoaDonRepository.existsById(hdDto.getMaHD())) {
                continue;
            }

            String targetBranch = isAdmin ? hdDto.getMaCN() : tokenBranch;
            ChiNhanh chiNhanh = chiNhanhRepository.findById(targetBranch).orElse(null);
            
            if (chiNhanh == null) continue;

            // Xây dựng Hóa Đơn
            HoaDon hoaDon = new HoaDon();
            hoaDon.setMaHD(hdDto.getMaHD());
            hoaDon.setMaCa(hdDto.getMaCa());
            hoaDon.setChiNhanh(chiNhanh);
            hoaDon.setTongTien(hdDto.getTongTien() != null ? hdDto.getTongTien() : BigDecimal.ZERO);
            hoaDon.setTrangThai(1); 
            hoaDon.setIsSynced(true); 
            
            try {
                hoaDon.setCreatedAt(LocalDateTime.parse(hdDto.getCreatedAt(), DateTimeFormatter.ISO_DATE_TIME));
            } catch (Exception e) {
                hoaDon.setCreatedAt(LocalDateTime.now());
            }

            hoaDonRepository.save(hoaDon);

            List<CTHD> listCTHD = new ArrayList<>();
            int stt = 1;
            
            for (SyncDataRequest.CTHDSyncDto ctDto : hdDto.getChiTiet()) {
                SanPham sp = sanPhamRepository.findById(ctDto.getMaSP()).orElse(null);
                if (sp == null) continue;

                CTHD cthd = new CTHD();
                cthd.setId(hoaDon.getMaHD() + "_" + stt++);
                cthd.setHoaDon(hoaDon);
                cthd.setSanPham(sp);
                cthd.setSoLuong(ctDto.getSoLuong());
                cthd.setGiaBanTaiThoiDiem(ctDto.getGiaBanTaiThoiDiem());
                cthd.setGhiChu(ctDto.getGhiChu());
                
                listCTHD.add(cthd);
            }
            
            cthdRepository.saveAll(listCTHD);

            truKhoService.truNguyenLieuTheoHoaDon(hoaDon.getMaHD());
            
            successCount++;
        }

        auditLogService.ghiLog(null, "HOADON", "BATCH_SYNC", "ĐỒNG BỘ OFFLINE", null, "Đã đồng bộ thành công " + successCount + " hóa đơn");
        return successCount;
    }
}