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
import com.phungloccoffee.backend.dto.HoaDonRequest;
import com.phungloccoffee.backend.entity.CTHD;
import com.phungloccoffee.backend.entity.ChiNhanh;
import com.phungloccoffee.backend.entity.HoaDon;
import com.phungloccoffee.backend.entity.SanPham;
import com.phungloccoffee.backend.repository.CTHDRepository;
import com.phungloccoffee.backend.repository.ChiNhanhRepository;
import com.phungloccoffee.backend.repository.HoaDonRepository;
import com.phungloccoffee.backend.repository.SanPhamRepository;

@Service
public class HoaDonService {
    @Autowired private HoaDonRepository hoaDonRepository;
    @Autowired private CTHDRepository cthdRepository;
    @Autowired private SanPhamRepository sanPhamRepository;
    @Autowired private ChiNhanhRepository chiNhanhRepository;

    @Transactional
    public ChiTietBillResponse taoHoaDon(HoaDonRequest request) {
        String maHD = taoMaHoaDon(request.getMaCN());
        ChiNhanh chiNhanh = chiNhanhRepository.findById(request.getMaCN()).orElse(null);

        HoaDon hoaDon = new HoaDon();
        hoaDon.setMaHD(maHD);
        hoaDon.setMaCa(request.getMaCa());
        hoaDon.setChiNhanh(chiNhanh);
        hoaDon.setTrangThai("Tạm");
        hoaDon.setIsSynced(false);
        hoaDon.setCreatedAt(LocalDateTime.now());
        
        // Lấy giảm giá từ request, nếu không có thì mặc định là 0
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

            // Tạo thực thể để lưu DB
            CTHD cthd = new CTHD();
            cthd.setId(maHD + "_" + stt++);
            cthd.setHoaDon(hoaDon);
            cthd.setSanPham(sp);
            cthd.setSoLuong(item.getSoLuong());
            cthd.setGiaBanTaiThoiDiem(sp.getGiaHienTai());
            cthd.setGhiChu(item.getGhiChu());
            listCTHD.add(cthd);

            // Tạo dữ liệu trả về cho Bill
            listResponse.add(new CTHDResponse(sp.getTenSP(), item.getSoLuong(), sp.getGiaHienTai(), thanhTien, item.getGhiChu()));
        }

        // Tính tổng tiền cuối cùng = Tổng món - Giảm giá
        hoaDon.setTongTien(tongTienChuaGiam.subtract(giamGia));

        hoaDonRepository.save(hoaDon);
        cthdRepository.saveAll(listCTHD);

        return new ChiTietBillResponse(maHD, chiNhanh != null ? chiNhanh.getTenCN() : "", hoaDon.getTongTien(), hoaDon.getTrangThai(), listResponse);
    }

    public ChiTietBillResponse getChiTietHoaDon(String maHD) {
        HoaDon hoaDon = hoaDonRepository.findById(maHD).orElse(null);
        if (hoaDon == null) return null;

        List<CTHD> listCTHD = cthdRepository.findByHoaDon(hoaDon);
        List<CTHDResponse> dsMon = new ArrayList<>();

        for (CTHD item : listCTHD) {
            BigDecimal thanhTien = item.getGiaBanTaiThoiDiem().multiply(BigDecimal.valueOf(item.getSoLuong()));
            dsMon.add(new CTHDResponse(item.getSanPham().getTenSP(), item.getSoLuong(), item.getGiaBanTaiThoiDiem(), thanhTien, item.getGhiChu()));
        }

        return new ChiTietBillResponse(hoaDon.getMaHD(), hoaDon.getChiNhanh().getTenCN(), hoaDon.getTongTien(), hoaDon.getTrangThai(), dsMon);
    }

    private String taoMaHoaDon(String maCN) {
        String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd_HHmmss"));
        int random = new Random().nextInt(9000) + 1000;
        return maCN + "_HD_" + time + "_" + random;
    }
}
