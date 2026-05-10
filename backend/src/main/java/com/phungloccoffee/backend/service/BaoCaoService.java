package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.DoanhThuChiNhanhResponse;
import com.phungloccoffee.backend.dto.DoanhThuSanPhamResponse;
import com.phungloccoffee.backend.repository.CTHDRepository;
import com.phungloccoffee.backend.repository.HoaDonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BaoCaoService {

    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired
    private CTHDRepository cthdRepository;

    public List<DoanhThuChiNhanhResponse> layDoanhThuChiNhanh(LocalDateTime tuNgay, LocalDateTime denNgay) {
        return hoaDonRepository.thongKeDoanhThuTheoChiNhanh(tuNgay, denNgay);
    }

    public List<DoanhThuSanPhamResponse> layDoanhThuSanPham(String maCN, LocalDateTime tuNgay, LocalDateTime denNgay) {
        return cthdRepository.thongKeDoanhThuTheoSanPham(maCN, tuNgay, denNgay);
    }
}