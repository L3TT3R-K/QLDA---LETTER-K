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
@Table(name = "nhacungcap")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class NhaCungCap {
    @Id
    @Column(name = "mancc", length = 50)
    private String maNCC;

    @Column(name = "tenncc", length = 150, nullable = false)
    private String tenNCC;

    @Column(name = "sdt", length = 20)
    private String sdt;

    @Column(name = "diachi", length = 255)
    private String diaChi;

    @Column(name = "trangthai", length = 30, nullable = false)
    private String trangThai;

    @CreationTimestamp
    @Column(name = "createdat", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updatedat", nullable = false)
    private LocalDateTime updatedAt;
}
