package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.NhanVienRequest;
import com.phungloccoffee.backend.dto.NhanVienResponse;
import com.phungloccoffee.backend.entity.NhanVien;
import com.phungloccoffee.backend.service.NhanVienService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nhanvien")
@RequiredArgsConstructor
@EnableWebSecurity
@EnableMethodSecurity
public class NhanVienController {

    private final NhanVienService nhanVienService;

    // Lấy danh sách dùng DTO (An toàn, không lộ Password)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'QUANLY', 'QUANLY_CHINHANH', 'NHANVIEN_KHO', 'KHO')")
    public ResponseEntity<List<NhanVienResponse>> getAll() {
        return ResponseEntity.ok(nhanVienService.getAllNhanVien());
    }

    // Lấy chi tiết 1 nhân viên dùng DTO
    @GetMapping("/{maNV}")
    @PreAuthorize("hasAnyRole('ADMIN', 'QUANLY', 'QUANLY_CHINHANH', 'NHANVIEN_KHO', 'KHO')")
    public ResponseEntity<NhanVienResponse> getById(@PathVariable String maNV) {
        return ResponseEntity.ok(nhanVienService.getEmployeeById(maNV));
    }

    // Thêm mới nhân viên
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'QUANLY_CHINHANH')")
    public ResponseEntity<?> create(@RequestBody NhanVienRequest request) {
        try {
            // Service đã bao gồm logic check trùng mã và mã hoá password
            NhanVien saved = nhanVienService.create(request);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            // Bắt lỗi (ví dụ: trùng username) và ném về cho Frontend hiển thị thông báo
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Cập nhật nhân viên
    @PutMapping("/{maNV}")
    @PreAuthorize("hasAnyRole('ADMIN', 'QUANLY_CHINHANH')")
    public ResponseEntity<?> update(@PathVariable String maNV, @RequestBody NhanVienRequest request) {
        try {
            NhanVien updated = nhanVienService.update(maNV, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Xóa mềm (Khóa tài khoản) nhân viên
    @DeleteMapping("/{maNV}")
    @PreAuthorize("hasAnyRole('ADMIN', 'QUANLY_CHINHANH')")
    public ResponseEntity<String> delete(@PathVariable String maNV) {
        try {
            nhanVienService.delete(maNV);
            return ResponseEntity.ok("Đã cập nhật trạng thái nghỉ việc cho nhân viên: " + maNV);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
