package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.entity.ChiNhanh;
import com.phungloccoffee.backend.service.ChiNhanhService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chinhanh")
public class ChiNhanhController {

    @Autowired
    private ChiNhanhService service;

    // [R] API Lấy tất cả
    @GetMapping
    public List<ChiNhanh> getAll() {
        return service.getAllChiNhanh();
    }

    // [C] API Thêm mới
    @PostMapping
    public ChiNhanh create(@RequestBody ChiNhanh chiNhanh) {
        return service.createChiNhanh(chiNhanh);
    }

    // [U] API Sửa thông tin (Dùng phương thức PUT)
    @PutMapping("/{maCN}")
    public ResponseEntity<ChiNhanh> update(@PathVariable String maCN, @RequestBody ChiNhanh chiNhanhDetails) {
        ChiNhanh updated = service.updateChiNhanh(maCN, chiNhanhDetails);
        if (updated != null) {
            return ResponseEntity.ok(updated); // Trả về mã 200 OK
        }
        return ResponseEntity.notFound().build(); // Trả về lỗi 404 nếu mã CN không tồn tại
    }

    // [D] API Xóa mềm (Dùng phương thức DELETE)
    @DeleteMapping("/{maCN}")
    public ResponseEntity<Void> delete(@PathVariable String maCN) {
        service.deleteChiNhanh(maCN);
        return ResponseEntity.ok().build();
    }
}