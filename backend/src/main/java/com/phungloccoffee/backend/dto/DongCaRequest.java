package com.phungloccoffee.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DongCaRequest {
    private BigDecimal tienCuoiCa;
    private BigDecimal soTienThatThoat;
    private String lyDoGiaiTrinh;
}