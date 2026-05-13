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
public class ChiTietBillResponse {
    private String maHD;
    private String tenChiNhanh;
    private BigDecimal tongTien;
    private String trangThai;
    private List<CTHDResponse> danhSachMon;
}
