package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.entity.DonVi;
import com.phungloccoffee.backend.service.DonViService;
import com.phungloccoffee.backend.dto.DonViResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/donvi")
public class DonViController {
    @Autowired private DonViService service;

    @GetMapping
    public List<DonViResponse> getAll() {
        return service.getAllDonVi();
    }

    @PostMapping
    public DonVi create(@RequestBody DonVi donVi) {
        return service.createDonVi(donVi);
    }

    @PutMapping("/{maDV}")
    public ResponseEntity<DonVi> update(@PathVariable String maDV, @RequestBody DonVi details) {
        DonVi updated = service.updateDonVi(maDV, details);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{maDV}")
    public ResponseEntity<Void> delete(@PathVariable String maDV) {
        service.deleteDonVi(maDV);
        return ResponseEntity.ok().build();
    }
}