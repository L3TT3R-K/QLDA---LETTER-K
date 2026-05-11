package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.CapNhatTrangThaiDieuChuyenRequest;
import com.phungloccoffee.backend.dto.PhieuDieuChuyenKhoRequest;
import com.phungloccoffee.backend.dto.PhieuDieuChuyenKhoResponse;
import com.phungloccoffee.backend.service.PhieuDieuChuyenKhoService;
import org.springframework.beans.factory.annotation.Autowired;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dieuchuyenkho")
public class PhieuDieuChuyenKhoController {

    @Autowired
    private PhieuDieuChuyenKhoService phieuDieuChuyenKhoService;

    @PostMapping
    public ResponseEntity<PhieuDieuChuyenKhoResponse> taoPhieuDieuChuyen(@RequestBody PhieuDieuChuyenKhoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(phieuDieuChuyenKhoService.taoPhieuDieuChuyen(request));
    }

    @GetMapping
    public List<PhieuDieuChuyenKhoResponse> getAll(
            @RequestParam(required = false) String maKho,
            @RequestParam(required = false) String trangThai
    ) {
        if (maKho != null && !maKho.trim().isEmpty()) {
            return phieuDieuChuyenKhoService.getByKho(maKho);
        }
        if (trangThai != null && !trangThai.trim().isEmpty()) {
            return phieuDieuChuyenKhoService.getByTrangThai(trangThai);
        }
        return phieuDieuChuyenKhoService.getAll();
    }

    @GetMapping("/{maPDC}")
    public PhieuDieuChuyenKhoResponse getById(@PathVariable String maPDC) {
        return phieuDieuChuyenKhoService.getById(maPDC);
    }

    @PostMapping("/{maPDC}/gui")
    public PhieuDieuChuyenKhoResponse guiPhieu(
            @PathVariable String maPDC,
            @RequestBody CapNhatTrangThaiDieuChuyenRequest request
    ) {
        return phieuDieuChuyenKhoService.guiPhieu(maPDC, request);
    }

    @PostMapping("/{maPDC}/nhan")
    public PhieuDieuChuyenKhoResponse nhanPhieu(
            @PathVariable String maPDC,
            @RequestBody CapNhatTrangThaiDieuChuyenRequest request
    ) {
        return phieuDieuChuyenKhoService.nhanPhieu(maPDC, request);
    }

    @PostMapping("/{maPDC}/huy")
    public PhieuDieuChuyenKhoResponse huyPhieu(
            @PathVariable String maPDC,
            @RequestBody(required = false) CapNhatTrangThaiDieuChuyenRequest request
    ) {
        return phieuDieuChuyenKhoService.huyPhieu(maPDC, request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }
}
