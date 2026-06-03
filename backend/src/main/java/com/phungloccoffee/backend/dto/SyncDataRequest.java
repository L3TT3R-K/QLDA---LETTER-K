package com.phungloccoffee.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class SyncDataRequest {
    private List<HoaDonSyncDto> danhSachHoaDon;

    @Data
    public static class HoaDonSyncDto {
        private String maHD; 
        private String maCa;
        private String maCN; 
        private BigDecimal tongTien;
        private BigDecimal giamGia;
        private String createdAt; 
        private List<CTHDSyncDto> chiTiet;
    }

    @Data
    public static class CTHDSyncDto {
        private String maSP;
        private Integer soLuong;
        private BigDecimal giaBanTaiThoiDiem;
        private String ghiChu;
    }
}