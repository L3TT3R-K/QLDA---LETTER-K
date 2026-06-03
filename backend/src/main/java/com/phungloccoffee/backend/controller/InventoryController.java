package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/stock")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'QUANLY', 'ROLE_QUANLY', 'NHANVIEN_KHO', 'ROLE_NHANVIEN_KHO')")
    public ResponseEntity<?> getStock(@RequestParam(required = false) String maCN) {
        try {
            return ResponseEntity.ok(inventoryService.getDanhSachTonKho(maCN));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy dữ liệu tồn kho: " + e.getMessage());
        }
    }
}