package com.phungloccoffee.backend.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.phungloccoffee.backend.dto.ChiTietBillResponse;
import com.phungloccoffee.backend.dto.HoaDonRequest;
import com.phungloccoffee.backend.dto.HoaDonResponse;
import com.phungloccoffee.backend.service.HoaDonService;

@RestController
@RequestMapping("/api/hoadon")
public class HoaDonController {
    @Autowired
    private HoaDonService service;

    @PostMapping
    public HoaDonResponse taoHoaDon(
        @RequestBody HoaDonRequest request
    ) {
        return service.taoHoaDon(request);
    }

    @GetMapping("/{maHD}")
    public ChiTietBillResponse getChiTietHoaDon(
        @PathVariable String maHD
    ) {
        return service.getChiTietHoaDon(maHD);
    }
}