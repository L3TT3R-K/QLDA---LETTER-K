package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.entity.NguyenLieu;
import com.phungloccoffee.backend.service.NguyenLieuService;
import com.phungloccoffee.backend.dto.NguyenLieuResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/nguyenlieu")
public class NguyenLieuController {
    @Autowired private NguyenLieuService service;

    @GetMapping
    public List<NguyenLieuResponse> getAll() {
        return service.getAllNguyenLieu();
    }

    @PostMapping
    public NguyenLieu create(@RequestBody NguyenLieu nl) {
        return service.createNguyenLieu(nl);
    }

    @PutMapping("/{maNL}")
    public ResponseEntity<NguyenLieu> update(@PathVariable String maNL, @RequestBody NguyenLieu details) {
        NguyenLieu updated = service.updateNguyenLieu(maNL, details);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{maNL}")
    public ResponseEntity<Void> delete(@PathVariable String maNL) {
        service.deleteNguyenLieu(maNL);
        return ResponseEntity.ok().build();
    }
}