package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.DongCaRequest;
import com.phungloccoffee.backend.dto.MoCaRequest;
import com.phungloccoffee.backend.entity.CaLamViec;
import com.phungloccoffee.backend.repository.CaLamViecRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CaLamViecService {

    private final CaLamViecRepository caLamViecRepository;
    private final AuditLogService auditLogService;

    public List<CaLamViec> getAll() {
        return caLamViecRepository.findAll();
    }

    public CaLamViec getById(String maCa) {
        return caLamViecRepository.findById(maCa)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca làm việc: " + maCa));
    }

    // Nghiệp vụ: MỞ CA
    public CaLamViec moCa(MoCaRequest request) {
        if (caLamViecRepository.existsById(request.getMaCa())) {
            throw new RuntimeException("Mã ca đã tồn tại!");
        }

        // Cậu có thể thêm logic kiểm tra xem Chi Nhánh này có ca nào đang mở chưa nếu muốn strict

        CaLamViec caLamViec = CaLamViec.builder()
                .maCa(request.getMaCa())
                .maNV(request.getMaNV())
                .maCN(request.getMaCN())
                .tienDauCa(request.getTienDauCa())
                .thoiGianMo(LocalDateTime.now()) // Tự động lấy giờ hiện tại
                .build();

        CaLamViec saved = caLamViecRepository.save(caLamViec);
        auditLogService.ghiLog(request.getMaNV(), "CALAMVIEC", saved.getMaCa(), "MỞ CA", null, saved);
        return saved;
    }

    // Nghiệp vụ: ĐÓNG CA
    public CaLamViec dongCa(String maCa, DongCaRequest request) {
        CaLamViec caLamViec = getById(maCa);

        if (caLamViec.getThoiGianDong() != null) {
            throw new RuntimeException("Ca làm việc này đã được đóng trước đó!");
        }

        CaLamViec oldData = CaLamViec.builder()
                .maCa(caLamViec.getMaCa()).maNV(caLamViec.getMaNV())
                .maCN(caLamViec.getMaCN()).thoiGianMo(caLamViec.getThoiGianMo()) // <--- Đã sửa thành .maCN
                .tienDauCa(caLamViec.getTienDauCa()).build();

        caLamViec.setThoiGianDong(LocalDateTime.now());
        caLamViec.setTienCuoiCa(request.getTienCuoiCa());
        caLamViec.setSoTienThatThoat(request.getSoTienThatThoat());
        caLamViec.setLyDoGiaiTrinh(request.getLyDoGiaiTrinh());

        CaLamViec saved = caLamViecRepository.save(caLamViec);
        auditLogService.ghiLog(caLamViec.getMaNV(), "CALAMVIEC", maCa, "ĐÓNG CA", oldData, saved);
        return saved;
    }
}