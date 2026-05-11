package com.phungloccoffee.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class PhieuDieuChuyenKhoRequest {
    private String maPC;
    private String maCNXuat;
    private String maCNNhap;
    private String maNVTao;
    private List<CTPhieuDieuChuyenKhoRequest> chiTiet;
}
