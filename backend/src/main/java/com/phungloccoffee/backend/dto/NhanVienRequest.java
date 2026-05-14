package com.phungloccoffee.backend.dto;

import lombok.Data;

@Data
public class NhanVienRequest {
    private String maNV;
    private String username;
    private String password; 
    private String tenNV;
    private String chucVu;
    private String maCN;
    private Integer trangThai;
}