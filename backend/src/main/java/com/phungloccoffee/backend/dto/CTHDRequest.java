package com.phungloccoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class CTHDRequest {
    private String maSP;
    private Integer soLuong;
    private String ghiChu;
}