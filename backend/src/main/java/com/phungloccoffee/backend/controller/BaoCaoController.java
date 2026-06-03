package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.ApiResponse;
import com.phungloccoffee.backend.dto.BaoCaoHaoHutResponse;
import com.phungloccoffee.backend.dto.BaoCaoTonKhoResponse;
import com.phungloccoffee.backend.dto.CanhBaoTonKhoTongHopResponse;
import com.phungloccoffee.backend.entity.InventoryTransaction;
import com.phungloccoffee.backend.service.BaoCaoService;
import com.phungloccoffee.backend.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/baocao")
public class BaoCaoController {
    @Autowired
    private BaoCaoService baoCaoService;

    @GetMapping("/doanhthu-chinhanh")
    public ResponseEntity<?> getDoanhThuChiNhanh(
            @RequestParam(value = "maCN", required = false) String maCN,
            @RequestParam("tuNgay") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam("denNgay") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        String maCNHienTai = SecurityUtils.resolveInventoryBranch(maCN);
        return ResponseEntity.ok(baoCaoService.layDoanhThuChiNhanh(maCNHienTai, tuNgay, denNgay));
    }

    @GetMapping("/doanhthu-sanpham")
    public ResponseEntity<?> getDoanhThuSanPham(
            @RequestParam("maCN") String maCN,
            @RequestParam("tuNgay") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam("denNgay") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        try {
            String validBranch = SecurityUtils.resolveInventoryBranch(maCN);
            return ResponseEntity.ok(baoCaoService.layDoanhThuSanPham(validBranch, tuNgay, denNgay));
        } catch (ResponseStatusException e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/ton-kho")
    public ResponseEntity<ApiResponse<List<BaoCaoTonKhoResponse>>> getBaoCaoTonKho(
            @RequestParam(value = "maCN", required = false) String maCN) {
        ApiResponse<List<BaoCaoTonKhoResponse>> response = new ApiResponse<>();
        response.setStatus(200);
        try {
            String maCNHienTai = resolveBranch(maCN);
            response.setMessage("Lấy báo cáo tồn kho thành công");
            response.setData(baoCaoService.layBaoCaoTonKho(maCNHienTai));
        } catch (ResponseStatusException e) {
            response.setMessage("Bỏ qua chi nhánh không có quyền truy cập");
            response.setData(new ArrayList<>());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/canh-bao-ton-kho")
    public ResponseEntity<ApiResponse<List<BaoCaoTonKhoResponse>>> getCanhBaoTonKho(
            @RequestParam(value = "maCN", required = false) String maCN) {
        ApiResponse<List<BaoCaoTonKhoResponse>> response = new ApiResponse<>();
        response.setStatus(200);
        try {
            String maCNHienTai = resolveBranch(maCN);
            response.setMessage("Lấy cảnh báo tồn kho thành công");
            response.setData(baoCaoService.layCanhBaoTonKho(maCNHienTai));
        } catch (ResponseStatusException e) {
            response.setMessage("Bỏ qua chi nhánh không có quyền truy cập");
            response.setData(new ArrayList<>());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/giao-dich-dong-bo-loi")
    public ResponseEntity<ApiResponse<List<InventoryTransaction>>> getGiaoDichDongBoLoi(
            @RequestParam(value = "maCN", required = false) String maCN) {
        ApiResponse<List<InventoryTransaction>> response = new ApiResponse<>();
        response.setStatus(200);
        try {
            String maCNHienTai = resolveBranch(maCN);
            response.setMessage("Lấy giao dịch đồng bộ lỗi thành công");
            response.setData(baoCaoService.layGiaoDichDongBoLoi(maCNHienTai));
        } catch (ResponseStatusException e) {
            response.setMessage("Bỏ qua chi nhánh không có quyền truy cập");
            response.setData(new ArrayList<>());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/canh-bao")
    public ResponseEntity<ApiResponse<CanhBaoTonKhoTongHopResponse>> getCanhBaoTongHop(
            @RequestParam(value = "maCN", required = false) String maCN) {
        ApiResponse<CanhBaoTonKhoTongHopResponse> response = new ApiResponse<>();
        response.setStatus(200);
        try {
            String maCNHienTai = resolveBranch(maCN);
            response.setMessage("Lấy cảnh báo tồn kho và đồng bộ thành công");
            response.setData(baoCaoService.layCanhBaoTongHop(maCNHienTai));
        } catch (ResponseStatusException e) {
            response.setMessage("Bỏ qua chi nhánh không có quyền truy cập");
            CanhBaoTonKhoTongHopResponse emptyData = CanhBaoTonKhoTongHopResponse.builder()
                    .duoiTonToiThieu(new ArrayList<>())
                    .tonAm(new ArrayList<>())
                    .giaoDichDongBoLoi(new ArrayList<>())
                    .soDuoiTonToiThieu(0)
                    .soTonAm(0)
                    .soGiaoDichDongBoLoi(0)
                    .tongCanhBao(0)
                    .build();
            response.setData(emptyData);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/hao-hut")
    public ResponseEntity<ApiResponse<List<BaoCaoHaoHutResponse>>> getBaoCaoHaoHut(
            @RequestParam(value = "maCN", required = false) String maCN,
            @RequestParam("tuNgay") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam("denNgay") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        ApiResponse<List<BaoCaoHaoHutResponse>> response = new ApiResponse<>();
        response.setStatus(200);
        try {
            String maCNHienTai = resolveBranch(maCN);
            response.setMessage("Lấy báo cáo hao hụt thành công");
            response.setData(baoCaoService.layBaoCaoHaoHut(maCNHienTai, tuNgay, denNgay));
        } catch (ResponseStatusException e) {
            response.setMessage("Bỏ qua chi nhánh không có quyền truy cập");
            response.setData(new ArrayList<>());
        }
        return ResponseEntity.ok(response);
    }

    private String resolveBranch(String maCN) {
        return SecurityUtils.resolveInventoryBranch(maCN);
    }
}
