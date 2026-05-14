package com.phungloccoffee.backend.dto;

import lombok.Data;

@Data
public class ChiNhanhRequest {
    private String maCN;
    private String tenCN;
    private String diaChi;
    private Integer trangThai;
}