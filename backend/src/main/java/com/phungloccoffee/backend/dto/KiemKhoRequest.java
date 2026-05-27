package com.phungloccoffee.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class KiemKhoRequest {
    private String maCN;
    private String maNV;
    private Boolean isSynced; 
    private List<CTKKRequest> chiTiet;
}