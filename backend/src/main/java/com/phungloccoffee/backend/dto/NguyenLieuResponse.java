package com.phungloccoffee.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class NguyenLieuResponse {
    private String maNL;
    private String tenNL;
    private Double tonToiThieu;
    private String tenDonVi;
    private Integer trangThai;
}