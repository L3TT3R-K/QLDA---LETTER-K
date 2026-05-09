package com.phungloccoffee.backend.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class HoaDonResponse {
    private String maHD;
    private BigDecimal tongTien;
    private String message;
}