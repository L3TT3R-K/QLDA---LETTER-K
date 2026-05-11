package com.phungloccoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PhieuDieuChuyenKhoResponse {
    private String maPC;
    private String maCNXuat;
    private String maCNNhap;
    private String maNVTao;
    private String tenNVTao;
    private LocalDateTime ngayTao;
    private String trangThai;
    private List<CTPhieuDieuChuyenKhoResponse> chiTiet;
}
