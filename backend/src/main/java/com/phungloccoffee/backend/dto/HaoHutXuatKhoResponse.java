package com.phungloccoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HaoHutXuatKhoResponse {
    private String maNL;
    private String tenNL;
    private String lyDo;
    private Double tongSoLuong;
}
