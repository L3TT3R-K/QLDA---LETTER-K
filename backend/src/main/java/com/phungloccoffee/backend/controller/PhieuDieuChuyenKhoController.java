package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.CapNhatTrangThaiDieuChuyenRequest;
import com.phungloccoffee.backend.dto.PhieuDieuChuyenKhoRequest;
import com.phungloccoffee.backend.dto.PhieuDieuChuyenKhoResponse;
import com.phungloccoffee.backend.service.PhieuDieuChuyenKhoService;
import com.phungloccoffee.backend.utils.SecurityUtils;
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
        request.setMaCNXuat(SecurityUtils.resolveInventoryBranch(request.getMaCNXuat()));
        return ResponseEntity.status(HttpStatus.CREATED).body(phieuDieuChuyenKhoService.taoPhieuDieuChuyen(request));
    }

    @GetMapping
    public List<PhieuDieuChuyenKhoResponse> getAll(
            @RequestParam(required = false) String maKho,
            @RequestParam(required = false) String trangThai
    ) {
        if (!SecurityUtils.canAccessAllBranches()) {
            String maCN = SecurityUtils.requireCurrentUserBranch();
            return filterByTrangThai(phieuDieuChuyenKhoService.getByKho(maCN), trangThai);
        }
        if (maKho != null && !maKho.trim().isEmpty()) {
            return filterByTrangThai(phieuDieuChuyenKhoService.getByKho(maKho), trangThai);
        }
        if (trangThai != null && !trangThai.trim().isEmpty()) {
            return phieuDieuChuyenKhoService.getByTrangThai(trangThai);
        }
        return phieuDieuChuyenKhoService.getAll();
    }

    @GetMapping("/{maPDC}")
    public PhieuDieuChuyenKhoResponse getById(@PathVariable String maPDC) {
        PhieuDieuChuyenKhoResponse response = phieuDieuChuyenKhoService.getById(maPDC);
        requireTransferAccess(response);
        return response;
    }

    @PostMapping("/{maPDC}/gui")
    public PhieuDieuChuyenKhoResponse guiPhieu(
            @PathVariable String maPDC,
            @RequestBody CapNhatTrangThaiDieuChuyenRequest request
    ) {
        requireSourceBranchAccess(phieuDieuChuyenKhoService.getById(maPDC));
        return phieuDieuChuyenKhoService.guiPhieu(maPDC, request);
    }

    @PostMapping("/{maPDC}/nhan")
    public PhieuDieuChuyenKhoResponse nhanPhieu(
            @PathVariable String maPDC,
            @RequestBody CapNhatTrangThaiDieuChuyenRequest request
    ) {
        requireDestinationBranchAccess(phieuDieuChuyenKhoService.getById(maPDC));
        return phieuDieuChuyenKhoService.nhanPhieu(maPDC, request);
    }

    @PostMapping("/{maPDC}/huy")
    public PhieuDieuChuyenKhoResponse huyPhieu(
            @PathVariable String maPDC,
            @RequestBody(required = false) CapNhatTrangThaiDieuChuyenRequest request
    ) {
        requireSourceBranchAccess(phieuDieuChuyenKhoService.getById(maPDC));
        return phieuDieuChuyenKhoService.huyPhieu(maPDC, request);
    }

    private List<PhieuDieuChuyenKhoResponse> filterByTrangThai(
            List<PhieuDieuChuyenKhoResponse> receipts,
            String trangThai
    ) {
        if (trangThai == null || trangThai.trim().isEmpty()) {
            return receipts;
        }
        List<String> matchingIds = phieuDieuChuyenKhoService.getByTrangThai(trangThai).stream()
                .map(PhieuDieuChuyenKhoResponse::getMaPC)
                .toList();
        return receipts.stream()
                .filter(receipt -> matchingIds.contains(receipt.getMaPC()))
                .toList();
    }

    private void requireTransferAccess(PhieuDieuChuyenKhoResponse response) {
        if (SecurityUtils.canAccessAllBranches()) {
            return;
        }
        String maCN = SecurityUtils.requireCurrentUserBranch();
        if (!maCN.equals(response.getMaCNXuat()) && !maCN.equals(response.getMaCNNhap())) {
            SecurityUtils.requireInventoryBranchAccess(response.getMaCNXuat());
        }
    }

    private void requireSourceBranchAccess(PhieuDieuChuyenKhoResponse response) {
        SecurityUtils.requireInventoryBranchAccess(response.getMaCNXuat());
    }

    private void requireDestinationBranchAccess(PhieuDieuChuyenKhoResponse response) {
        SecurityUtils.requireInventoryBranchAccess(response.getMaCNNhap());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }
}
