package com.phungloccoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NguyenLieuResponse {
    private String maNL;
    private String tenNL;
    private String donViCoBan;
    private Double tonToiThieu; 
    private Integer trangThai;
}

