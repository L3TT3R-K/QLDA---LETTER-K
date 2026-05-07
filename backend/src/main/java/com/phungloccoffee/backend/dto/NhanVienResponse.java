package com.phungloccoffee.backend.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NhanVienResponse{
    
    private String maNV;
    private String tenNV;
    private String chucVu;
    
    private String tenChiNhanh; 
}