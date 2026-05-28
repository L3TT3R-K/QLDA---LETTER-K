package com.phungloccoffee.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface DonHangGanNhatResponse {
    String getMaHD();
    String getMaCN();
    String getTenCN();
    String getMaNV();
    String getTenNV();
    BigDecimal getTongTien();
    LocalDateTime getCreatedAt();
    Integer getTrangThai();
}
