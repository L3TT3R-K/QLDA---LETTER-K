package com.phungloccoffee.backend.dto;
import java.time.LocalDateTime;

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

public class BaoCaoHaoHutResponse {
    private String maKK;
    private LocalDateTime ngayKiem;
    private String maNL;
    private String tenNL;
    private Double soLuongHeThong;
    private Double soLuongThucTe;
    private Double chenhLech;
    private Double tyLeHaoHut; //Tính theo phần trăm
}