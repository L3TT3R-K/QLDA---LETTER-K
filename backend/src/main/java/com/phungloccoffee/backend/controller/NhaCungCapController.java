package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.entity.NhaCungCap;
import com.phungloccoffee.backend.service.NhaCungCapService;
import com.phungloccoffee.backend.dto.NhaCungCapResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/nhacungcap")
public class NhaCungCapController {
    @Autowired private NhaCungCapService service;

    @GetMapping
    public List<NhaCungCapResponse> getAll() {
        return service.getAllNCC();
    }

    @PostMapping
    public NhaCungCap create(@RequestBody NhaCungCap ncc) {
        return service.createNCC(ncc);
    }

    @PutMapping("/{maNCC}")
    public ResponseEntity<NhaCungCap> update(@PathVariable String maNCC, @RequestBody NhaCungCap details) {
        NhaCungCap updated = service.updateNCC(maNCC, details);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{maNCC}")
    public ResponseEntity<Void> delete(@PathVariable String maNCC) {
        service.deleteNCC(maNCC);
        return ResponseEntity.ok().build();
    }
}