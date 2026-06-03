package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.TonKhoResponse;
import com.phungloccoffee.backend.repository.TonKhoRepository;
import com.phungloccoffee.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final TonKhoRepository tonKhoRepository;

    public List<TonKhoResponse> getDanhSachTonKho(String maCNRequest) {
        boolean isAdmin = SecurityUtils.canAccessAllBranches();
        String myBranch = SecurityUtils.getCurrentUserBranch();

        List<Object[]> results;

        if (isAdmin) {
            if (maCNRequest == null || maCNRequest.isBlank() || "all".equalsIgnoreCase(maCNRequest) || "null".equalsIgnoreCase(maCNRequest)) {
                results = tonKhoRepository.layDanhSachTonKho(); 
            } else {
                results = tonKhoRepository.layDanhSachTonKhoTheoChiNhanh(maCNRequest);
            }
        } else {
            if (myBranch == null || myBranch.isBlank() || "null".equalsIgnoreCase(myBranch)) {
                throw new RuntimeException("Lỗi nghiêm trọng: Tài khoản của bạn chưa được cấp mã chi nhánh trong hệ thống!");
            }
            results = tonKhoRepository.layDanhSachTonKhoTheoChiNhanh(myBranch);
        }

        return results.stream().map(row -> {
            Double hienTai = ((Number) row[5]).doubleValue(); 
            Double toiThieu = ((Number) row[6]).doubleValue();
            
            String stt = "Bình thường";
            if (hienTai <= 0) stt = "Hết hàng";
            else if (hienTai <= toiThieu) stt = "Nguy hiểm";
            else if (hienTai <= toiThieu * 1.5) stt = "Cảnh báo";

            return TonKhoResponse.builder()
                    .maNL((String) row[0])
                    .tenNguyenLieu((String) row[1])
                    .donVi((String) row[2])
                    .maCN((String) row[3])
                    .chiNhanh((String) row[4])
                    .tonHienTai(hienTai)
                    .tonToiThieu(toiThieu)
                    .trangThai(stt)
                    .build();
        }).toList();
    }
}