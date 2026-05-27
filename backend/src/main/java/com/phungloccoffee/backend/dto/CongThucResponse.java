package com.phungloccoffee.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class CongThucResponse {
    private String maPB;
    private String maSP;
    private String tenSP;
    private List<ChiTietDinhMucDTO> chiTiet;
}