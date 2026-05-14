package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.ChiNhanhRequest;
import com.phungloccoffee.backend.entity.ChiNhanh;
import com.phungloccoffee.backend.service.ChiNhanhService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chinhanh")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChiNhanhController {

    private final ChiNhanhService chiNhanhService;

    @GetMapping
    public List<ChiNhanh> getAll() { return chiNhanhService.getAll(); }

    @GetMapping("/{maCN}")
    public ChiNhanh getById(@PathVariable String maCN) { return chiNhanhService.getById(maCN); }

    @PostMapping
    public ChiNhanh create(@RequestBody ChiNhanhRequest request) { return chiNhanhService.create(request); }

    @PutMapping("/{maCN}")
    public ChiNhanh update(@PathVariable String maCN, @RequestBody ChiNhanhRequest request) { 
        return chiNhanhService.update(maCN, request); 
    }

    @DeleteMapping("/{maCN}")
    public String delete(@PathVariable String maCN) {
        chiNhanhService.delete(maCN);
        return "Đã ngưng hoạt động chi nhánh: " + maCN;
    }
}