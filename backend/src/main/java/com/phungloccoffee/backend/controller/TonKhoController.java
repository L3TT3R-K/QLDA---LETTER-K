package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.entity.TonKho;
import com.phungloccoffee.backend.repository.TonKhoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tonkho")
@RequiredArgsConstructor
public class TonKhoController {

    private final TonKhoRepository tonKhoRepo;

    @GetMapping("/{maCN}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'QUANLY_CHINHANH', 'ROLE_QUANLY_CHINHANH', 'NHANVIEN_KHO', 'ROLE_NHANVIEN_KHO')")
    public ResponseEntity<List<TonKho>> getTonKhoByChiNhanh(@PathVariable String maCN) {
        return ResponseEntity.ok(tonKhoRepo.findByMaCN(maCN));
    }
}