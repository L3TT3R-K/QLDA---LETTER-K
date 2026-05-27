package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.TonKhoResponse;
import com.phungloccoffee.backend.repository.TonKhoRepository;
import com.phungloccoffee.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final TonKhoRepository tonKhoRepository;

    public List<TonKhoResponse> getDanhSachTonKho() {
        String maCN = SecurityUtils.requireCurrentUserBranch();
        List<Object[]> results = tonKhoRepository.layDanhSachTonKhoTheoChiNhanh(maCN);
        return results.stream().map(row -> {
            // Lưu ý: Thứ tự row[index] phải khớp chính xác với câu SELECT trong Repository
            Double hienTai = ((Number) row[5]).doubleValue(); 
            Double toiThieu = ((Number) row[6]).doubleValue();
            
            // Xử lý logic trạng thái màu sắc cho UI
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
