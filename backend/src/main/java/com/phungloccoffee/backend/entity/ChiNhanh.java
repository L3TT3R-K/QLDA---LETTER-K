package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "chinhanh")
@Data
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
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp // Tự động cập nhật giờ khi có chỉnh sửa
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}