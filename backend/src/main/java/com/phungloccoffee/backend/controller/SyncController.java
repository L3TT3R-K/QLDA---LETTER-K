package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.SyncDataRequest;
import com.phungloccoffee.backend.service.SyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sync")
@RequiredArgsConstructor
public class SyncController {

    private final SyncService syncService;

    @PostMapping("/offline-data")
    public ResponseEntity<?> syncOfflineData(@RequestBody SyncDataRequest request) {
        try {
            int count = syncService.xuLyDongBo(request);
            return ResponseEntity.ok("Đồng bộ thành công " + count + " hóa đơn lên máy chủ.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi đồng bộ: " + e.getMessage());
        }
    }
}