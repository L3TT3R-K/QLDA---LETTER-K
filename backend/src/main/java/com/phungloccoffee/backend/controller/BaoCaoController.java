package com.phungloccoffee.backend.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.phungloccoffee.backend.dto.ApiResponse;
import com.phungloccoffee.backend.dto.BaoCaoHaoHutResponse;
import com.phungloccoffee.backend.dto.BaoCaoTonKhoResponse;
import com.phungloccoffee.backend.service.BaoCaoService;

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

    @GetMapping("/ton-kho")
    public ResponseEntity<ApiResponse<List<BaoCaoTonKhoResponse>>> getBaoCaoTonKho(
            @RequestParam("maCN") String maCN) {
        List<BaoCaoTonKhoResponse> data = baoCaoService.layBaoCaoTonKho(maCN);
        ApiResponse<List<BaoCaoTonKhoResponse>> response = new ApiResponse<>();
        response.setStatus(200);
        response.setMessage("Lấy báo cáo tồn kho thành công");
        response.setData(data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/hao-hut")
    public ResponseEntity<ApiResponse<List<BaoCaoHaoHutResponse>>> getBaoCaoHaoHut(
            @RequestParam("maCN") String maCN,
            @RequestParam("tuNgay") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam("denNgay") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        List<BaoCaoHaoHutResponse> data = baoCaoService.layBaoCaoHaoHut(maCN, tuNgay, denNgay);
        ApiResponse<List<BaoCaoHaoHutResponse>> response = new ApiResponse<>();
        response.setStatus(200);
        response.setMessage("Lấy báo cáo hao hụt thành công");
        response.setData(data);
        return ResponseEntity.ok(response);
    }
}