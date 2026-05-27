package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.CongThucRequest;
import com.phungloccoffee.backend.dto.CongThucResponse;
import com.phungloccoffee.backend.service.CongThucService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/congthuc")
@RequiredArgsConstructor
public class CongThucController {

    private final CongThucService congThucService;

    @GetMapping("/{maSP}")
    @PreAuthorize("hasAnyRole('ADMIN', 'QUANLY_CHINHANH')")
    public ResponseEntity<CongThucResponse> getCongThucBySanPham(@PathVariable String maSP) {
        return ResponseEntity.ok(congThucService.getCongThuc(maSP));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<String> saveCongThuc(@RequestBody CongThucRequest request) {
        congThucService.saveCongThuc(request);
        return ResponseEntity.ok("Đã cập nhật công thức thành công!");
    }
}