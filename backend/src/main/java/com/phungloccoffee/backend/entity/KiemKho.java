package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "kiemkho")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KiemKho {

    @Id
    @Column(name = "makk", length = 50)
    private String maKK;

    // Nối với bảng Nhân Viên (Khoa đã làm)
    @ManyToOne
    @JoinColumn(name = "manv")
    private NhanVien nhanVien;

    // Nối với bảng Chi Nhánh (Khoa đã làm)
    @ManyToOne
    @JoinColumn(name = "macn")
    private ChiNhanh chiNhanh;

    @Column(name = "ngaykiem")
    private LocalDateTime ngayKiem;

    @Column(name = "issynced")
    private Boolean isSynced;

    @CreationTimestamp
    @Column(name = "createdat", updatable = false)
    private LocalDateTime createdAt;
}