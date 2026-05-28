package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.NguyenLieuResponse;
import com.phungloccoffee.backend.entity.NguyenLieu;
import com.phungloccoffee.backend.service.NguyenLieuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nguyenlieu")
@RequiredArgsConstructor
public class NguyenLieuController {

    private final NguyenLieuService nguyenLieuService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'NHANVIEN_KHO', 'NHANVIEN_BANHANG')")
    public ResponseEntity<List<NguyenLieuResponse>> getAll() {
        return ResponseEntity.ok(nguyenLieuService.getAllNguyenLieu());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'NHANVIEN_KHO')")
    public ResponseEntity<NguyenLieu> create(@RequestBody NguyenLieuResponse request) {
        return ResponseEntity.ok(nguyenLieuService.createNguyenLieu(request));
    }

    @PutMapping("/{maNL}")
    @PreAuthorize("hasAnyRole('ADMIN', 'NHANVIEN_KHO')")
    public ResponseEntity<NguyenLieu> update(@PathVariable String maNL, @RequestBody NguyenLieuResponse request) {
        NguyenLieu updated = nguyenLieuService.updateNguyenLieu(maNL, request);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{maNL}")
    @PreAuthorize("hasAnyRole('ADMIN', 'NHANVIEN_KHO')")
    public ResponseEntity<String> delete(@PathVariable String maNL) {
        nguyenLieuService.deleteNguyenLieu(maNL);
        return ResponseEntity.ok("Đã ngưng sử dụng nguyên liệu");
    }
}
