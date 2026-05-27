package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.PhieuNhapRequest;
import com.phungloccoffee.backend.dto.PhieuNhapResponse;
import com.phungloccoffee.backend.service.PhieuNhapService;
import com.phungloccoffee.backend.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nhapkho")
public class PhieuNhapController {

    @Autowired
    private PhieuNhapService phieuNhapService;

    @PostMapping
    public ResponseEntity<PhieuNhapResponse> taoPhieuNhap(@RequestBody PhieuNhapRequest request) {
        request.setMaCN(SecurityUtils.resolveInventoryBranch(request.getMaCN()));
        return ResponseEntity.status(HttpStatus.CREATED).body(phieuNhapService.taoPhieuNhap(request));
    }

    @GetMapping
    public List<PhieuNhapResponse> getAll(
            @RequestParam(required = false) String maNCC,
            @RequestParam(required = false) String maCN
    ) {
        String maCNHienTai = SecurityUtils.resolveInventoryBranch(maCN);
        if (maNCC != null && !maNCC.trim().isEmpty()) {
            if (maCNHienTai != null && !maCNHienTai.trim().isEmpty()) {
                return phieuNhapService.getByNhaCungCapAndChiNhanh(maNCC, maCNHienTai);
            }
            return phieuNhapService.getByNhaCungCap(maNCC);
        }
        if (maCNHienTai != null && !maCNHienTai.trim().isEmpty()) {
            return phieuNhapService.getByChiNhanh(maCNHienTai);
        }
        return phieuNhapService.getAll();
    }

    @GetMapping("/{maPN}")
    public PhieuNhapResponse getById(@PathVariable String maPN) {
        PhieuNhapResponse response = phieuNhapService.getById(maPN);
        SecurityUtils.requireInventoryBranchAccess(response.getMaCN());
        return response;
    }

    @PutMapping("/{maPN}")
    public PhieuNhapResponse capNhatPhieuNhap(
            @PathVariable String maPN,
            @RequestBody PhieuNhapRequest request
    ) {
        request.setMaCN(SecurityUtils.resolveInventoryBranch(request.getMaCN()));
        SecurityUtils.requireInventoryBranchAccess(phieuNhapService.getById(maPN).getMaCN());
        return phieuNhapService.capNhatPhieuNhap(maPN, request);
    }

    @DeleteMapping("/{maPN}")
    public ResponseEntity<Void> xoaPhieuNhap(@PathVariable String maPN) {
        SecurityUtils.requireInventoryBranchAccess(phieuNhapService.getById(maPN).getMaCN());
        phieuNhapService.xoaPhieuNhap(maPN);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }
}
