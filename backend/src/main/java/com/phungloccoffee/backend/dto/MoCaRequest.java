package com.phungloccoffee.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MoCaRequest {
    private String maCa;
    private String maNV;
    private String maCN;
    private BigDecimal tienDauCa;
}