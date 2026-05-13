package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.HaoHutXuatKhoResponse;
import com.phungloccoffee.backend.dto.PhieuXuatKhoRequest;
import com.phungloccoffee.backend.dto.PhieuXuatKhoResponse;
import com.phungloccoffee.backend.service.PhieuXuatKhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/xuatkho")
public class PhieuXuatKhoController {

    @Autowired
    private PhieuXuatKhoService phieuXuatKhoService;

    @PostMapping
    public ResponseEntity<PhieuXuatKhoResponse> taoPhieuXuatKho(@RequestBody PhieuXuatKhoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(phieuXuatKhoService.taoPhieuXuatKho(request));
    }

    @PostMapping("/xuat-nguyen-lieu")
    public ResponseEntity<PhieuXuatKhoResponse> xuatNguyenLieu(@RequestBody PhieuXuatKhoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(phieuXuatKhoService.xuatNguyenLieu(request));
    }

    @PostMapping("/hao-hut")
    public ResponseEntity<PhieuXuatKhoResponse> ghiNhanHaoHut(@RequestBody PhieuXuatKhoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(phieuXuatKhoService.ghiNhanHaoHut(request));
    }

    @GetMapping
    public List<PhieuXuatKhoResponse> getAll(@RequestParam(required = false) String maCN) {
        if (maCN != null && !maCN.trim().isEmpty()) {
            return phieuXuatKhoService.getByChiNhanh(maCN);
        }
        return phieuXuatKhoService.getAll();
    }

    @GetMapping("/{maPX}")
    public PhieuXuatKhoResponse getById(@PathVariable String maPX) {
        return phieuXuatKhoService.getById(maPX);
    }

    @GetMapping("/hao-hut")
    public List<HaoHutXuatKhoResponse> thongKeHaoHut(
            @RequestParam("maCN") String maCN,
            @RequestParam("tuNgay") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam("denNgay") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay
    ) {
        return phieuXuatKhoService.thongKeHaoHut(maCN, tuNgay, denNgay);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }
}
