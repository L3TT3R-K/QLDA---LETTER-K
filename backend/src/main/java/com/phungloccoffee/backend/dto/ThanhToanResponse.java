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
public class ThanhToanResponse {
    private String maTT;
    private String maHD;
    private BigDecimal soTien;
    private String phuongThuc;
    private String message;
}