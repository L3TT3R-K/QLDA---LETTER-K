package com.phungloccoffee.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class KiemKhoRequest {
    private String maKK;
    private String maNV; 
    private String maCN; 
    private List<CTKKRequest> chiTiet; 
}