package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.service.BaoCaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/baocao")
public class BaoCaoController {

    @Autowired
    private BaoCaoService baoCaoService;

    
    @GetMapping("/doanhthu-chinhanh")
    public ResponseEntity<?> getDoanhThuChiNhanh(
            @RequestParam("tuNgay") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam("denNgay") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        
        return ResponseEntity.ok(baoCaoService.layDoanhThuChiNhanh(tuNgay, denNgay));
    }

   
    @GetMapping("/doanhthu-sanpham")
    public ResponseEntity<?> getDoanhThuSanPham(
            @RequestParam("maCN") String maCN,
            @RequestParam("tuNgay") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam("denNgay") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        
        return ResponseEntity.ok(baoCaoService.layDoanhThuSanPham(maCN, tuNgay, denNgay));
    }
}