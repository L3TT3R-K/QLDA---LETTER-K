package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.CTKKRequest;
import com.phungloccoffee.backend.dto.KiemKhoRequest;
import com.phungloccoffee.backend.entity.ChiNhanh;
import com.phungloccoffee.backend.entity.CTKK;
import com.phungloccoffee.backend.entity.KiemKho;
import com.phungloccoffee.backend.entity.NhanVien;
import com.phungloccoffee.backend.service.KiemKhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/kiemkho")
public class KiemKhoController {

    @Autowired
    private KiemKhoService kiemKhoService;

    @PostMapping
    public ResponseEntity<?> taoPhieuKiemKho(@RequestBody KiemKhoRequest request) {
        
        KiemKho kiemKho = new KiemKho();
        kiemKho.setMaKK(request.getMaKK());
        kiemKho.setNgayKiem(LocalDateTime.now());
        kiemKho.setIsSynced(false);

        NhanVien nv = new NhanVien();
        nv.setMaNV(request.getMaNV());
        kiemKho.setNhanVien(nv);

        ChiNhanh cn = new ChiNhanh();
        cn.setMaCN(request.getMaCN());
        kiemKho.setChiNhanh(cn);

        List<CTKK> danhSachChiTiet = new ArrayList<>();
        if (request.getChiTiet() != null) {
            for (CTKKRequest dto : request.getChiTiet()) {
                CTKK chiTiet = new CTKK();
                chiTiet.setMaKK(request.getMaKK());
                chiTiet.setMaNL(dto.getMaNL());
                chiTiet.setSoLuongHeThong(dto.getSoLuongHeThong());
                chiTiet.setSoLuongThucTe(dto.getSoLuongThucTe());
                danhSachChiTiet.add(chiTiet);
            }
        }

        KiemKho result = kiemKhoService.luuPhieuKiemKho(kiemKho, danhSachChiTiet);

        return ResponseEntity.ok(result);
    }
}