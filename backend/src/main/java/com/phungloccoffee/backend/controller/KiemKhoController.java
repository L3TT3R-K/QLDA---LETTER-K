package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.KiemKhoChiTietResponse;
import com.phungloccoffee.backend.dto.KiemKhoRequest;
import com.phungloccoffee.backend.service.KiemKhoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kiemkho")
@RequiredArgsConstructor
public class KiemKhoController {

    private final KiemKhoService kiemKhoService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'QUANLY_CHINHANH', 'ROLE_QUANLY_CHINHANH', 'NHANVIEN_KHO', 'ROLE_NHANVIEN_KHO')")
    public ResponseEntity<List<KiemKhoChiTietResponse>> getAll() {
        return ResponseEntity.ok(kiemKhoService.getAllLichSuKiemKho());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'QUANLY_CHINHANH', 'ROLE_QUANLY_CHINHANH', 'NHANVIEN_KHO', 'ROLE_NHANVIEN_KHO')")
    public ResponseEntity<String> createKiemKho(@RequestBody KiemKhoRequest request) {
        kiemKhoService.taoPhieuKiemKho(request);
        return ResponseEntity.ok("Tạo phiếu kiểm kho thành công!");
    }
}