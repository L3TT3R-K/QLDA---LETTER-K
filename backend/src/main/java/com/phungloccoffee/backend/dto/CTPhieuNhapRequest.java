package com.phungloccoffee.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CTPhieuNhapRequest {
    private String maLo;
    private String maLoNguon;
    private String maNL;
    private Double soLuong;
    private Double donGiaNhap;
    private java.time.LocalDate hanSuDung;
}
