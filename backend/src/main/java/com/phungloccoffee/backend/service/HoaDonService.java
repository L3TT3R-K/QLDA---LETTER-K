package com.phungloccoffee.backend.service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.phungloccoffee.backend.dto.CTHDRequest;
import com.phungloccoffee.backend.dto.CTHDResponse;
import com.phungloccoffee.backend.dto.ChiTietBillResponse;
import com.phungloccoffee.backend.dto.HoaDonRequest;
import com.phungloccoffee.backend.dto.HoaDonResponse;
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
    @Autowired
    private HoaDonRepository hoaDonRepository;
    
    @Autowired
    private CTHDRepository cthdRepository;

    @Autowired
    private SanPhamRepository sanPhamRepository;

    @Autowired
    private ChiNhanhRepository chiNhanhRepository;

    public HoaDonResponse taoHoaDon(HoaDonRequest request) {
        BigDecimal tongTien = BigDecimal.ZERO;

        // Tạo mã hóa đơn
        String maHD = taoMaHoaDon(request.getMaCN());

        // Tìm chi nhánh
        ChiNhanh chiNhanh = chiNhanhRepository
                .findById(request.getMaCN())
                .orElse(null);

        // Tạo hóa đơn
        HoaDon hoaDon = new HoaDon();

        hoaDon.setMaHD(maHD);
        hoaDon.setMaCa(request.getMaCa());
        hoaDon.setChiNhanh(chiNhanh);
        hoaDon.setTrangThai(0);
        hoaDon.setIsSynced(false);

        // Lưu trước để có hóa đơn cha
        hoaDonRepository.save(hoaDon);

        int stt = 1;

        // Duyệt từng món
        for (CTHDRequest item : request.getDanhSachMon()) {
            SanPham sanPham = sanPhamRepository
                    .findById(item.getMaSP())
                    .orElse(null);
            if (sanPham == null) {
                continue;
            }

            // Tính tiền dòng
            BigDecimal thanhTien = sanPham.getGiaHienTai()
                    .multiply(BigDecimal.valueOf((long) item.getSoLuong()));

            tongTien = tongTien.add(thanhTien);

            // Tạo chi tiết hóa đơn
            CTHD cthd = new CTHD();
            cthd.setId(maHD + "_" + stt);
            cthd.setHoaDon(hoaDon);
            cthd.setSanPham(sanPham);
            cthd.setSoLuong(item.getSoLuong());
            cthd.setGiaBanTaiThoiDiem(sanPham.getGiaHienTai());
            cthd.setGhiChu(item.getGhiChu());
            cthdRepository.save(cthd);
            stt++;
        }

        // Update tổng tiền
        hoaDon.setTongTien(tongTien);
        hoaDonRepository.save(hoaDon);
        return new HoaDonResponse(
                maHD,
                tongTien,
                "Tạo hóa đơn thành công"
        );
    }

    public ChiTietBillResponse getChiTietHoaDon(
        String maHD
) {
        HoaDon hoaDon = hoaDonRepository
            .findById(maHD)
            .orElse(null);

        if (hoaDon == null) {
                return null;
        }

        List<CTHD> listCTHD = cthdRepository.findByHoaDon(hoaDon);

        List<CTHDResponse> danhSachMon = new ArrayList<>();

        for (CTHD item : listCTHD) {
                CTHDResponse dto = new CTHDResponse();
                dto.setTenSP(
                        item.getSanPham().getTenSP()
                );

                dto.setSoLuong(
                        item.getSoLuong()
                );

                dto.setDonGia(
                        item.getGiaBanTaiThoiDiem()
                );

        // thành tiền
                dto.setThanhTien(
                        item.getGiaBanTaiThoiDiem()
                                .multiply(
                                        java.math.BigDecimal.valueOf(
                                                item.getSoLuong()
                                        )
                                )
                );

                dto.setGhiChu(
                        item.getGhiChu()
                );

        danhSachMon.add(dto);
    }

    return new ChiTietBillResponse(
            hoaDon.getMaHD(),
            hoaDon.getChiNhanh().getTenCN(),
            hoaDon.getTongTien(),
            hoaDon.getTrangThai(),
            danhSachMon
    );
}

    // Hàm tạo mã hóa đơn
    private String taoMaHoaDon(String maCN) {
        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("yyMMdd_HHmmss");
        String time =
                LocalDateTime.now().format(formatter);
        int random =
                new Random().nextInt(9000) + 1000;
        return maCN + "_HD_" + time + "_" + random;
    }
}