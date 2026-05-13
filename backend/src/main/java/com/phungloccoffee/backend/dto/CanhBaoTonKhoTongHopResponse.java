package com.phungloccoffee.backend.dto;

import com.phungloccoffee.backend.entity.InventoryTransaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CanhBaoTonKhoTongHopResponse {
    private List<BaoCaoTonKhoResponse> duoiTonToiThieu;
    private List<BaoCaoTonKhoResponse> tonAm;
    private List<InventoryTransaction> giaoDichDongBoLoi;
    private Integer soDuoiTonToiThieu;
    private Integer soTonAm;
    private Integer soGiaoDichDongBoLoi;
    private Integer tongCanhBao;
}
