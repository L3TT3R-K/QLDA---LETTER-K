package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "auditlog")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @Column(name = "logid", length = 50)
    private String logID;

    @Column(name = "manv", length = 50)
    private String maNV;

    @Column(name = "thucthe", length = 50)
    private String thucThe;

    @Column(name = "recordid", length = 50)
    private String recordID;

    @Column(name = "hanhdong", length = 20)
    private String hanhDong;

    // Ép kiểu chuẩn JSONB cho PostgreSQL
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dulieucu", columnDefinition = "jsonb")
    private String duLieuCu;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dulieumoi", columnDefinition = "jsonb")
    private String duLieuMoi;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}