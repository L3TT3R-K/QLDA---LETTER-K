package com.phungloccoffee.backend.dto;

import java.math.BigDecimal;

public interface DoanhThuChiNhanhResponse {
    String getMaCN();
    String getTenCN(); 
    BigDecimal getTongDoanhThu();
    Long getSoLuongDon();
}