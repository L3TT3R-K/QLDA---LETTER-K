package com.phungloccoffee.backend.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.phungloccoffee.backend.dto.ThanhToanRequest;
import com.phungloccoffee.backend.dto.ThanhToanResponse;
import com.phungloccoffee.backend.service.ThanhToanService;

@RestController
@RequestMapping("/api/thanhtoan")
public class ThanhToanController {
    @Autowired
    private ThanhToanService service;

    @PostMapping
    public ThanhToanResponse thanhToan(
        @RequestBody ThanhToanRequest request
    ) {
        return service.thanhToan(request);
    }
}