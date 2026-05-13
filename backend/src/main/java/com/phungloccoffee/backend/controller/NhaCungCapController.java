package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.NhaCungCapResponse;
import com.phungloccoffee.backend.entity.NhaCungCap;
import com.phungloccoffee.backend.service.NhaCungCapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nhacungcap")
public class NhaCungCapController {
    @Autowired private NhaCungCapService service;

    @GetMapping
    public List<NhaCungCapResponse> getAll(
            @RequestParam(required = false) String trangThai,
            @RequestParam(defaultValue = "false") boolean includeInactive
    ) {
        return service.getAllNCC(trangThai, includeInactive);
    }

    @GetMapping("/{maNCC}")
    public ResponseEntity<NhaCungCapResponse> getById(@PathVariable String maNCC) {
        NhaCungCapResponse ncc = service.getById(maNCC);
        return ncc != null ? ResponseEntity.ok(ncc) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<NhaCungCapResponse> create(@RequestBody NhaCungCap ncc) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createNCC(ncc));
    }

    @PutMapping("/{maNCC}")
    public ResponseEntity<NhaCungCapResponse> update(@PathVariable String maNCC, @RequestBody NhaCungCap details) {
        NhaCungCapResponse updated = service.updateNCC(maNCC, details);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{maNCC}")
    public ResponseEntity<Void> delete(@PathVariable String maNCC) {
        return service.deleteNCC(maNCC) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }
}
