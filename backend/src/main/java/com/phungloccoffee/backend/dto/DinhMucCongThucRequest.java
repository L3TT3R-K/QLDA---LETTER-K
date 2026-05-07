package com.phungloccoffee.backend.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DinhMucCongThucRequest {

  private String maPB;

  private String maNL;

  private BigDecimal soLuong;
}
