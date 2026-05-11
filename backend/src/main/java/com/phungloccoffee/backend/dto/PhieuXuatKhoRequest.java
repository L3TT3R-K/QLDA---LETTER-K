package com.phungloccoffee.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class PhieuXuatKhoRequest {
    private String maPX;
    private String maCN;
    private String maNV;
    private String lyDo;
    private List<CTPhieuXuatKhoRequest> chiTiet;
}
