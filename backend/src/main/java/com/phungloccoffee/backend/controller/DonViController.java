package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.DonViRequest;
import com.phungloccoffee.backend.entity.DonVi;
import com.phungloccoffee.backend.service.DonViService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/donvi")
@RequiredArgsConstructor
@CrossOrigin("*")
public class DonViController {
    private final DonViService donViService;
    @GetMapping public List<DonVi> getAll() { return donViService.getAll(); }
    @PostMapping public DonVi create(@RequestBody DonViRequest request) { return donViService.create(request); }
    @DeleteMapping("/{maDV}") public String delete(@PathVariable String maDV) { donViService.delete(maDV); return "Đã xóa đơn vị!"; }
}