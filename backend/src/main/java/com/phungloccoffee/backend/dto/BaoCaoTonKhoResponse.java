package com.phungloccoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaoCaoTonKhoResponse {
    private String maCN;
    private String maNL;
    private String tenNL;
    private Double soLuongTon;
    private Double tonToiThieu;
    private String trangThai;
    private String loaiCanhBao;
    private String mucDo;
    private String thongDiep;
}
