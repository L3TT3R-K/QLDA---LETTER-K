package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.ChiNhanhRequest;
import com.phungloccoffee.backend.entity.ChiNhanh;
import com.phungloccoffee.backend.repository.ChiNhanhRepository;
import com.phungloccoffee.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChiNhanhService {

    private final ChiNhanhRepository chiNhanhRepository;
    private final AuditLogService auditLogService; 

    // Chặn quyền
    private void requireAdminAccess() {
        if (!SecurityUtils.canAccessAllBranches()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ Admin mới có quyền thao tác dữ liệu chi nhánh");
        }
    }

    public List<ChiNhanh> getAll() {
        return chiNhanhRepository.findAll();
    }

    public ChiNhanh getById(String maCN) {
        return chiNhanhRepository.findById(maCN)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi nhánh: " + maCN));
    }

    public ChiNhanh create(ChiNhanhRequest request) {
        requireAdminAccess();
        if (chiNhanhRepository.existsById(request.getMaCN())) {
            throw new RuntimeException("Mã chi nhánh đã tồn tại!");
        }

        ChiNhanh cn = ChiNhanh.builder()
                .maCN(request.getMaCN())
                .tenCN(request.getTenCN())
                .diaChi(request.getDiaChi())
                .trangThai(request.getTrangThai() != null ? request.getTrangThai() : 1)
                .build();

        ChiNhanh saved = chiNhanhRepository.save(cn);
        auditLogService.ghiLog(null, "CHINHANH", saved.getMaCN(), "INSERT", null, saved);
        return saved;
    }

    public ChiNhanh update(String maCN, ChiNhanhRequest request) {
        requireAdminAccess();
        ChiNhanh cn = getById(maCN);
        
        ChiNhanh oldData = ChiNhanh.builder()
                .maCN(cn.getMaCN()).tenCN(cn.getTenCN())
                .diaChi(cn.getDiaChi()).trangThai(cn.getTrangThai()).build();

        cn.setTenCN(request.getTenCN());
        cn.setDiaChi(request.getDiaChi());
        cn.setTrangThai(request.getTrangThai());

        ChiNhanh saved = chiNhanhRepository.save(cn);
        auditLogService.ghiLog(null, "CHINHANH", maCN, "UPDATE", oldData, saved);
        return saved;
    }

    public void delete(String maCN) {
        requireAdminAccess();
        ChiNhanh cn = getById(maCN);
        ChiNhanh oldData = ChiNhanh.builder()
                .maCN(cn.getMaCN()).tenCN(cn.getTenCN())
                .diaChi(cn.getDiaChi()).trangThai(cn.getTrangThai()).build();

        cn.setTrangThai(0); 
        ChiNhanh saved = chiNhanhRepository.save(cn);
        auditLogService.ghiLog(null, "CHINHANH", maCN, "DELETE (SOFT)", oldData, saved);
    }
}