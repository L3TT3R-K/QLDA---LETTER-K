// package com.phungloccoffee.backend.service;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.phungloccoffee.backend.entity.AuditLog;
// import com.phungloccoffee.backend.repository.AuditLogRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import java.time.LocalDateTime;

// @Service
// public class AuditLogService {

//     private final AuditLogRepository auditLogRepository;
//     private final ObjectMapper objectMapper;

//     // Chuẩn mực Constructor Injection của Spring Boot
//     @Autowired
//     public AuditLogService(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
//         this.auditLogRepository = auditLogRepository;
//         this.objectMapper = objectMapper;
//     }

//     public void ghiLog(String maNV, String thucThe, String recordID, String hanhDong, Object duLieuCu, Object duLieuMoi) {
//         try {
//             AuditLog log = new AuditLog();
//             log.setLogID("LOG_" + System.currentTimeMillis()); 
//             log.setMaNV(maNV);
//             log.setThucThe(thucThe);
//             log.setRecordID(recordID);
//             log.setHanhDong(hanhDong);
            
//             log.setDuLieuCu(duLieuCu != null ? objectMapper.writeValueAsString(duLieuCu) : null);
//             log.setDuLieuMoi(duLieuMoi != null ? objectMapper.writeValueAsString(duLieuMoi) : null);
            
//             log.setCreatedAt(LocalDateTime.now());

//             auditLogRepository.save(log);
//             System.out.println("✅ [AUDIT LOG] Đã ghi nhận hành động: " + hanhDong + " trên bảng " + thucThe);
//         } catch (Exception e) {
//             System.err.println("❌ [AUDIT LOG] Lỗi khi ghi log: " + e.getMessage());
//         }
//     }
// }