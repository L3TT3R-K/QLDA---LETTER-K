package com.phungloccoffee.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phungloccoffee.backend.dto.AuditLogResponse;
import com.phungloccoffee.backend.entity.AuditLog;
import com.phungloccoffee.backend.entity.NhanVien;
import com.phungloccoffee.backend.repository.AuditLogRepository;
import com.phungloccoffee.backend.repository.NhanVienRepository;
import com.phungloccoffee.backend.utils.SecurityUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;
    private final NhanVienRepository nhanVienRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, ObjectMapper objectMapper, NhanVienRepository nhanVienRepository) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
        this.nhanVienRepository = nhanVienRepository;
    }

    public List<AuditLogResponse> getAllLogs() {
        String maCN = SecurityUtils.getCurrentUserBranch();
        List<AuditLog> rawLogs = auditLogRepository.findAllByMaCN(maCN);

        List<AuditLogResponse> responseList = new ArrayList<>();
        for (AuditLog log : rawLogs) {
            String action = log.getHanhDong() != null ? log.getHanhDong().toUpperCase() : "INFO";
            String type = "info";
            if (action.contains("THÊM") || action.contains("TẠO") || action.contains("NHẬP") || action.contains("CREATE")) type = "success";
            else if (action.contains("XÓA") || action.contains("HỦY") || action.contains("DELETE")) type = "error";
            else if (action.contains("CẢNH BÁO") || action.contains("WARNING")) type = "warning";

            String details = "Bản ghi ID: " + log.getRecordID();
            if (log.getDuLieuMoi() != null && !log.getDuLieuMoi().equals("null")) {
                details += " | Cập nhật: " + log.getDuLieuMoi();
            }

            String username = log.getMaNV(); 
            String branch = "Hệ thống";
            try {
                // ĐÃ SỬA CHUẨN XÁC THEO ENTITY NHANVIEN CỦA TEAM:
                NhanVien nv = nhanVienRepository.findByUsername(log.getMaNV()).orElse(null);
                if (nv != null) {
                    username = nv.getTenNV(); // Lấy đúng tên nhân viên
                    if (nv.getMaCN() != null && !nv.getMaCN().isEmpty()) { 
                        branch = nv.getMaCN(); // Gọi trực tiếp getMaCN() vì nó là String
                    }
                }
            } catch (Exception ignored) {}

            responseList.add(AuditLogResponse.builder()
                    .id(log.getLogID())
                    .createdAt(log.getCreatedAt())
                    .username(username)
                    .action(log.getHanhDong())
                    .module(log.getThucThe())
                    .details(details)
                    .type(type)
                    .maCN(branch)
                    .build());
        }
        return responseList;
    }

    public void ghiLog(String maNVIgnored, String thucThe, String recordID, String hanhDong, Object duLieuCu, Object duLieuMoi) {
        try {
            String currentUser = "SYSTEM";
            try {
                currentUser = SecurityUtils.requireCurrentUsername();
            } catch (Exception e) {
            }

            AuditLog log = new AuditLog();
            log.setLogID("LOG_" + System.currentTimeMillis()); 
            log.setMaNV(currentUser); 
            log.setThucThe(thucThe);
            log.setRecordID(recordID);
            log.setHanhDong(hanhDong);
            
            log.setDuLieuCu(duLieuCu != null ? objectMapper.writeValueAsString(duLieuCu) : null);
            log.setDuLieuMoi(duLieuMoi != null ? objectMapper.writeValueAsString(duLieuMoi) : null);
            log.setCreatedAt(LocalDateTime.now());

            auditLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("❌ [AUDIT LOG] Lỗi khi ghi log: " + e.getMessage());
        }
    }
}