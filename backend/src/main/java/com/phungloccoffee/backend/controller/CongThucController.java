package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.CongThucRequest;
import com.phungloccoffee.backend.dto.CongThucResponse;
import com.phungloccoffee.backend.service.CongThucService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/congthuc")
@RequiredArgsConstructor
public class CongThucController {

    private final CongThucService congThucService;

    @GetMapping("/{maSP}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'QUANLY', 'ROLE_QUANLY', 'QUANLY_CHINHANH', 'ROLE_QUANLY_CHINHANH', 'NHANVIEN_BANHANG', 'ROLE_NHANVIEN_BANHANG')")
    public ResponseEntity<CongThucResponse> getCongThucBySanPham(@PathVariable String maSP) {
        return ResponseEntity.ok(congThucService.getCongThuc(maSP));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'QUANLY', 'ROLE_QUANLY', 'QUANLY_CHINHANH', 'ROLE_QUANLY_CHINHANH')")
    public ResponseEntity<String> saveCongThuc(@RequestBody CongThucRequest request) {
        try {
            congThucService.saveCongThuc(request);
            return ResponseEntity.ok("Da cap nhat cong thuc thanh cong!");
        } catch (RuntimeException exception) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(exception.getMessage());
        }
    }
}