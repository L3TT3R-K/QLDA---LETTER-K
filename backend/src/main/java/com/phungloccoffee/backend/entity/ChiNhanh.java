package com.phungloccoffee.backend.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "chinhanh")
@Getter
@Setter
@NoArgsConstructor 
@AllArgsConstructor
public class ChiNhanh {

    @Id // Khóa chính không tự tăng vì là VARCHAR
    @Column(name = "macn", length = 20)
    private String maCN;

    @Column(name = "tencn", length = 100)
    private String tenCN;

    @Column(name = "diachi", length = 255)
    private String diaChi;

    @Column(name = "trangthai")
    private Integer trangThai; // 1: Hoạt động, 0: Tạm đóng, -1: Giải thể

    @CreationTimestamp // Tự động lấy giờ hệ thống khi tạo mới
    @Column(name = "createdat", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp // Tự động cập nhật giờ khi có chỉnh sửa
    @Column(name = "updatedat")
    private LocalDateTime updatedAt;
}