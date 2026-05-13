package com.phungloccoffee.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhienBanCongThucRequest {

  private String maPB;

  private String maSP;

  private LocalDateTime ngayHieuLuc;

  private String trangThai;
}
