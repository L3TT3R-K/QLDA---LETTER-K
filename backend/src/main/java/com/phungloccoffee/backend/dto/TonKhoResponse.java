package com.phungloccoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TonKhoResponse {
    private String maNL;
    private String tenNguyenLieu;
    private String donVi;
    private String maCN;
    private String chiNhanh;
    private Double tonHienTai;
    private Double tonToiThieu;
    private String trangThai;
}