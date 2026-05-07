package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.entity.CaLamViec;
import com.phungloccoffee.backend.dto.CaLamViecResponse;
import com.phungloccoffee.backend.service.CaLamViecService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calamviec")
public class CaLamViecController {

    @Autowired
    private CaLamViecService service;

    @GetMapping
    public List<CaLamViecResponse> getAll() {
        return service.getAllCaLamViec(); 
    }

    @PostMapping
    public CaLamViec create(@RequestBody CaLamViec caLamViec) {
        return service.createCaLamViec(caLamViec);
    }

    @PutMapping("/{maCa}")
    public ResponseEntity<CaLamViec> update(@PathVariable String maCa, @RequestBody CaLamViec caLamViecDetails) {
        CaLamViec updated = service.updateCaLamViec(maCa, caLamViecDetails);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{maCa}")
    public ResponseEntity<Void> delete(@PathVariable String maCa) {
        service.deleteCaLamViec(maCa);
        return ResponseEntity.ok().build();
    }
}