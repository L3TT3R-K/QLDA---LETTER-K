package com.phungloccoffee.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class PhieuNhapRequest {
    private String maPN;
    private String maNCC;
    private String maCN;
    private String maNV;
    private LocalDateTime ngayNhap;
    private String ghiChu;
    private List<CTPhieuNhapRequest> chiTiet;
}
