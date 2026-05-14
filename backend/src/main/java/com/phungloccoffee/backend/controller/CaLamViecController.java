package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.DongCaRequest;
import com.phungloccoffee.backend.dto.MoCaRequest;
import com.phungloccoffee.backend.entity.CaLamViec;
import com.phungloccoffee.backend.service.CaLamViecService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calamviec")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CaLamViecController {

    private final CaLamViecService caLamViecService;

    @GetMapping
    public List<CaLamViec> getAll() {
        return caLamViecService.getAll();
    }

    @GetMapping("/{maCa}")
    public CaLamViec getById(@PathVariable String maCa) {
        return caLamViecService.getById(maCa);
    }

    @PostMapping("/moca")
    public CaLamViec moCa(@RequestBody MoCaRequest request) {
        return caLamViecService.moCa(request);
    }

    @PutMapping("/dongca/{maCa}")
    public CaLamViec dongCa(@PathVariable String maCa, @RequestBody DongCaRequest request) {
        return caLamViecService.dongCa(maCa, request);
    }
}