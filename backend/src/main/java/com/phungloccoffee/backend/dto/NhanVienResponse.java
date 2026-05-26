package com.phungloccoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NhanVienResponse {
    private String maNV;
    private String username;
    private String tenNV; 
    private String chucVu;
    private String tenChiNhanh; 
    private Integer trangThai;
}