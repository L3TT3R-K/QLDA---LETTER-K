package com.phungloccoffee.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phungloccoffee.backend.entity.AuditLog;
import com.phungloccoffee.backend.repository.AuditLogRepository;
import com.phungloccoffee.backend.utils.SecurityUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AuditLogService(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    public List<AuditLog> getAllLogs() {
        String maCN = SecurityUtils.getCurrentUserBranch();
        return auditLogRepository.findAllByMaCN(maCN);
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