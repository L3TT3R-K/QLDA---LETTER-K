package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.NhanVienRequest;
import com.phungloccoffee.backend.entity.NhanVien;
import com.phungloccoffee.backend.service.NhanVienService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nhanvien")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NhanVienController {

    private final NhanVienService nhanVienService;

    @GetMapping
    public List<NhanVien> getAll() { return nhanVienService.getAll(); }

    @GetMapping("/{maNV}")
    public NhanVien getById(@PathVariable String maNV) { return nhanVienService.getById(maNV); }

    @PostMapping
    public NhanVien create(@RequestBody NhanVienRequest request) { return nhanVienService.create(request); }

    @PutMapping("/{maNV}")
    public NhanVien update(@PathVariable String maNV, @RequestBody NhanVienRequest request) {
        return nhanVienService.update(maNV, request);
    }

    @DeleteMapping("/{maNV}")
    public String delete(@PathVariable String maNV) {
        nhanVienService.delete(maNV);
        return "Đã cập nhật trạng thái nghỉ việc cho nhân viên: " + maNV;
    }
}