package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
    
    @Query(value = """
        SELECT a.* FROM auditlog a 
        LEFT JOIN nhanvien nv ON a.manv = nv.username 
        WHERE (:maCN IS NULL OR nv.macn = :maCN)
        ORDER BY a.createdat DESC
        """, nativeQuery = true)
    List<AuditLog> findAllByMaCN(@Param("maCN") String maCN);
}