package com.phungloccoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CTPhieuNhapResponse {
    private String maLo;
    private String maNL;
    private String tenNL;
    private Double soLuong;
    private Double donGiaNhap;
    private Double thanhTien;
    private java.time.LocalDate hanSuDung;
}
