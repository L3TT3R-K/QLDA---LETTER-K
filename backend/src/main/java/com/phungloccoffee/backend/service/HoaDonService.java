package com.phungloccoffee.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.phungloccoffee.backend.dto.CTHDRequest;
import com.phungloccoffee.backend.dto.CTHDResponse;
import com.phungloccoffee.backend.dto.ChiTietBillResponse;
import com.phungloccoffee.backend.dto.DonHangGanNhatResponse;
import com.phungloccoffee.backend.dto.HoaDonRequest;
import com.phungloccoffee.backend.entity.CTHD;
import com.phungloccoffee.backend.entity.ChiNhanh;
import com.phungloccoffee.backend.entity.HoaDon;
import com.phungloccoffee.backend.entity.SanPham;
import com.phungloccoffee.backend.repository.CTHDRepository;
import com.phungloccoffee.backend.repository.ChiNhanhRepository;
import com.phungloccoffee.backend.repository.HoaDonRepository;
import com.phungloccoffee.backend.repository.SanPhamRepository;


import com.phungloccoffee.backend.utils.SecurityUtils;

@Service
public class HoaDonService {
    @Autowired private HoaDonRepository hoaDonRepository;
    @Autowired private CTHDRepository cthdRepository;
    @Autowired private SanPhamRepository sanPhamRepository;
    @Autowired private ChiNhanhRepository chiNhanhRepository;
    @Autowired private TruKhoService truKhoService;

    @Transactional
    public ChiTietBillResponse taoHoaDon(HoaDonRequest request) {
        if (!SecurityUtils.canAccessAllBranches()) {
            request.setMaCN(SecurityUtils.requireCurrentUserBranch());
        }

        String maHD = taoMaHoaDon(request.getMaCN());
        ChiNhanh chiNhanh = chiNhanhRepository.findById(request.getMaCN()).orElse(null);

        HoaDon hoaDon = new HoaDon();
        hoaDon.setMaHD(maHD);
        hoaDon.setMaCa(request.getMaCa());
        hoaDon.setChiNhanh(chiNhanh);
        hoaDon.setTrangThai(0);
        hoaDon.setIsSynced(false);
        hoaDon.setCreatedAt(LocalDateTime.now());
        
        BigDecimal giamGia = request.getGiamGia() != null ? request.getGiamGia() : BigDecimal.ZERO;
        hoaDon.setGiamGia(giamGia);

        BigDecimal tongTienChuaGiam = BigDecimal.ZERO;
        List<CTHD> listCTHD = new ArrayList<>();
        List<CTHDResponse> listResponse = new ArrayList<>();

        int stt = 1;
        for (CTHDRequest item : request.getDanhSachMon()) {
            SanPham sp = sanPhamRepository.findById(item.getMaSP()).orElse(null);
            if (sp == null) continue;

            BigDecimal thanhTien = sp.getGiaHienTai().multiply(BigDecimal.valueOf(item.getSoLuong()));
            tongTienChuaGiam = tongTienChuaGiam.add(thanhTien);

            CTHD cthd = new CTHD();
            cthd.setId(maHD + "_" + stt++);
            cthd.setHoaDon(hoaDon);
            cthd.setSanPham(sp);
            cthd.setSoLuong(item.getSoLuong());
            cthd.setGiaBanTaiThoiDiem(sp.getGiaHienTai());
            cthd.setGhiChu(item.getGhiChu());
            listCTHD.add(cthd);

            listResponse.add(new CTHDResponse(sp.getTenSP(), item.getSoLuong(), sp.getGiaHienTai(), thanhTien, item.getGhiChu()));
        }

        hoaDon.setTongTien(tongTienChuaGiam.subtract(giamGia));

        hoaDonRepository.save(hoaDon);
        cthdRepository.saveAll(listCTHD);


        truKhoService.truNguyenLieuTheoHoaDon(maHD);

        return new ChiTietBillResponse(maHD, chiNhanh != null ? chiNhanh.getTenCN() : "", hoaDon.getTongTien(), hoaDon.getTrangThai(), listResponse);
    }

    public ChiTietBillResponse getChiTietHoaDon(String maHD) {
        HoaDon hoaDon = hoaDonRepository.findById(maHD).orElse(null);
        if (hoaDon == null) return null;

        if (!SecurityUtils.canAccessAllBranches()) {
             String myBranch = SecurityUtils.requireCurrentUserBranch();
             if (!myBranch.equals(hoaDon.getChiNhanh().getMaCN())) {
                  throw new RuntimeException("Không có quyền xem chi tiết hóa đơn của chi nhánh khác");
             }
        }

        List<CTHD> listCTHD = cthdRepository.findByHoaDon(hoaDon);
        List<CTHDResponse> dsMon = new ArrayList<>();

        for (CTHD item : listCTHD) {
            BigDecimal thanhTien = item.getGiaBanTaiThoiDiem().multiply(BigDecimal.valueOf(item.getSoLuong()));
            dsMon.add(new CTHDResponse(item.getSanPham().getTenSP(), item.getSoLuong(), item.getGiaBanTaiThoiDiem(), thanhTien, item.getGhiChu()));
        }

        return new ChiTietBillResponse(hoaDon.getMaHD(), hoaDon.getChiNhanh().getTenCN(), hoaDon.getTongTien(), hoaDon.getTrangThai(), dsMon);
    }

    public List<DonHangGanNhatResponse> layDonHangGanNhat(String maCN, int limit) {
        String maCNHopLe = SecurityUtils.resolveInventoryBranch(maCN);
        int safeLimit = Math.max(1, Math.min(limit, 20));
        return hoaDonRepository.layDonHangGanNhat(maCNHopLe, safeLimit);
    }

    private String taoMaHoaDon(String maCN) {
        String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd_HHmmss"));
        int random = new Random().nextInt(9000) + 1000;
        return maCN + "_HD_" + time + "_" + random;
    }
}