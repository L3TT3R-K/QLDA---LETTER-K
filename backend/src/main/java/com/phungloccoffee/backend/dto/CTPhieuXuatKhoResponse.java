package com.phungloccoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CTPhieuXuatKhoResponse {
    private String maLo;
    private String maNL;
    private String tenNL;
    private Double soLuong;
    private java.time.LocalDate hanSuDung;
}
