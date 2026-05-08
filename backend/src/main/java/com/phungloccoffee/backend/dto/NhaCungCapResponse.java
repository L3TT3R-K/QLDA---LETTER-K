package com.phungloccoffee.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class NhaCungCapResponse {
    private String maNCC;
    private String tenNCC;
    private Integer trangThai;
}