package com.phungloccoffee.backend.dto;

import java.math.BigDecimal;

public interface DoanhThuSanPhamResponse {
    String getMaSP();
    String getTenSP();
    Long getTongSoLuongBan(); 
    BigDecimal getTongDoanhThu();
}