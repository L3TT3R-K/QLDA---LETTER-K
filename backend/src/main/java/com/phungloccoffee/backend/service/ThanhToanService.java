package com.phungloccoffee.backend.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.phungloccoffee.backend.dto.ThanhToanRequest;
import com.phungloccoffee.backend.dto.ThanhToanResponse;
import com.phungloccoffee.backend.entity.HoaDon;
import com.phungloccoffee.backend.entity.ThanhToan;
import com.phungloccoffee.backend.repository.HoaDonRepository;
import com.phungloccoffee.backend.repository.ThanhToanRepository;

@Service

public class ThanhToanService {
    @Autowired
    private ThanhToanRepository thanhToanRepository;

    @Autowired
    private HoaDonRepository hoaDonRepository;

    public ThanhToanResponse thanhToan(
        ThanhToanRequest request
    ) {
        HoaDon hoaDon = hoaDonRepository
            .findById(request.getMaHD())
            .orElse(null);

        if (hoaDon == null) {
            return new ThanhToanResponse(
                null,
                null,
                null,
                null,
                "Không tìm thấy hóa đơn"
            );
        }

        // Tạo payment
        ThanhToan thanhToan = new ThanhToan();
        String maTT = taoMaThanhToan();
        thanhToan.setMaTT(maTT);
        thanhToan.setHoaDon(hoaDon);
        thanhToan.setPhuongThuc(
            request.getPhuongThuc()
        );
        thanhToan.setSoTien(
            request.getSoTien()
        );

        thanhToan.setTrangThai(1);
        thanhToan.setIsSynced(false);
        thanhToanRepository.save(thanhToan);

        // Update hóa đơn
        hoaDon.setTrangThai(1);
        hoaDonRepository.save(hoaDon);
        return new ThanhToanResponse(
            maTT,
            hoaDon.getMaHD(),
            request.getSoTien(),
            request.getPhuongThuc(),
            "Thanh toán thành công"
        );
    }

    private String taoMaThanhToan() {
        DateTimeFormatter formatter =
            DateTimeFormatter.ofPattern("yyMMdd_HHmmss");
        String time =
            LocalDateTime.now().format(formatter);
        int random =
            new Random().nextInt(9000) + 1000;
        return "TT_" + time + "_" + random;
    }
}