package com.phungloccoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PhieuNhapResponse {
    private String maPN;
    private String maNCC;
    private String tenNCC;
    private String maCN;
    private String tenCN;
    private String maNV;
    private String tenNV;
    private LocalDateTime ngayNhap;
    private Double tongTien;
    private Integer trangThai;
    private List<CTPhieuNhapResponse> chiTiet;
}
