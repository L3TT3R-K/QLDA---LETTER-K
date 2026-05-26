package com.phungloccoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietDinhMucDTO {
    private String maNL;
    private String tenNL; 
    private String donViCoBan; 
    private BigDecimal soLuong;
}