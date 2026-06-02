package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.ChiNhanhRequest;
import com.phungloccoffee.backend.entity.ChiNhanh;
import com.phungloccoffee.backend.repository.ChiNhanhRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChiNhanhService {

    private final ChiNhanhRepository chiNhanhRepository;
    private final AuditLogService auditLogService; // Gắn Camera giám sát luôn

    public List<ChiNhanh> getAll() {
        return chiNhanhRepository.findAll();
    }

    public ChiNhanh getById(String maCN) {
        return chiNhanhRepository.findById(maCN)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chi nhánh: " + maCN));
    }

    public ChiNhanh create(ChiNhanhRequest request) {
        validateRequest(request, true);

        if (chiNhanhRepository.existsById(request.getMaCN())) {
            throw new IllegalArgumentException("Mã chi nhánh đã tồn tại!");
        }
        if (chiNhanhRepository.existsByTenCNIgnoreCase(request.getTenCN().trim())) {
            throw new IllegalArgumentException("Tên chi nhánh đã tồn tại!");
        }

        ChiNhanh cn = ChiNhanh.builder()
                .maCN(request.getMaCN().trim())
                .tenCN(request.getTenCN().trim())
                .diaChi(request.getDiaChi().trim())
                .trangThai(request.getTrangThai() != null ? request.getTrangThai() : 1)
                .build();

        ChiNhanh saved = chiNhanhRepository.save(cn);
        auditLogService.ghiLog("NV_ADMIN", "CHINHANH", saved.getMaCN(), "INSERT", null, saved);
        return saved;
    }

    public ChiNhanh update(String maCN, ChiNhanhRequest request) {
        validateRequest(request, false);

        ChiNhanh cn = getById(maCN);
        if (chiNhanhRepository.existsByTenCNIgnoreCaseAndMaCNNot(request.getTenCN().trim(), maCN)) {
            throw new IllegalArgumentException("Tên chi nhánh đã tồn tại!");
        }
        
        // Tạo bản sao lưu AuditLog
        ChiNhanh oldData = ChiNhanh.builder()
                .maCN(cn.getMaCN()).tenCN(cn.getTenCN())
                .diaChi(cn.getDiaChi()).trangThai(cn.getTrangThai()).build();

        cn.setTenCN(request.getTenCN().trim());
        cn.setDiaChi(request.getDiaChi().trim());
        cn.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : cn.getTrangThai());

        ChiNhanh saved = chiNhanhRepository.save(cn);
        auditLogService.ghiLog("NV_ADMIN", "CHINHANH", maCN, "UPDATE", oldData, saved);
        return saved;
    }

    public void delete(String maCN) {
        ChiNhanh cn = getById(maCN);
        ChiNhanh oldData = ChiNhanh.builder()
                .maCN(cn.getMaCN()).tenCN(cn.getTenCN())
                .diaChi(cn.getDiaChi()).trangThai(cn.getTrangThai()).build();

        cn.setTrangThai(0); // Xóa mềm
        ChiNhanh saved = chiNhanhRepository.save(cn);
        auditLogService.ghiLog("NV_ADMIN", "CHINHANH", maCN, "DELETE (SOFT)", oldData, saved);
    }

    private void validateRequest(ChiNhanhRequest request, boolean requireMaCN) {
        if (request == null || (requireMaCN && isBlank(request.getMaCN())) || isBlank(request.getTenCN()) || isBlank(request.getDiaChi())) {
            throw new IllegalArgumentException("Vui lòng nhập đầy đủ mã, tên và địa chỉ chi nhánh.");
        }
        if (request.getTrangThai() != null && request.getTrangThai() != 0 && request.getTrangThai() != 1) {
            throw new IllegalArgumentException("Trạng thái chi nhánh không hợp lệ.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
