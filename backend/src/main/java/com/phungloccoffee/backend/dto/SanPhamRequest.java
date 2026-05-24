package com.phungloccoffee.backend.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SanPhamRequest {

  private String maSP;

  private String tenSP;

  private BigDecimal giaHienTai;

  private Boolean isTopping;

  private Integer trangThai;
}
