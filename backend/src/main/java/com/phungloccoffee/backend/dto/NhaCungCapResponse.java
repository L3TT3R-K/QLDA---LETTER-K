package com.phungloccoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NhaCungCapResponse {
    private String maNCC;
    private String tenNCC;
    private String sdt;
    private String diaChi;
    private Integer trangThai;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
