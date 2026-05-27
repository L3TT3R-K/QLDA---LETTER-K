package com.phungloccoffee.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class KiemKhoChiTietResponse {
    private String maKK;
    private LocalDateTime ngayKiem;
    private String maNL;
    private String tenNL;
    private String donVi;
    private Double soLuongHeThong;
    private Double soLuongThucTe;
    private Double chenhLech;
    private Double phanTramSaiLech; 
    private String tenChiNhanh;
    private String tenNhanVien;
    private Boolean isSynced; 
}