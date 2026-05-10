package com.phungloccoffee.backend.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class HoaDonRequest {
    private String maCN;
    private String maCa;
    private BigDecimal giamGia;
    private List<CTHDRequest> danhSachMon;
}