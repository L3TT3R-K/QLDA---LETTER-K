package com.phungloccoffee.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CongThucRequest {
    private String maSP;
    private List<ChiTietDinhMucDTO> chiTiet; 
}