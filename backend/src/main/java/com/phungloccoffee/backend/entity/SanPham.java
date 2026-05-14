package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sanpham") // Đưa về chữ thường
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SanPham {

  @Id
  @Column(name = "masp", length = 50)
  private String maSP;

  @Column(name = "tensp", nullable = false, length = 150)
  private String tenSP;

  @Column(name = "giahientai", nullable = false, precision = 18, scale = 0)
  private BigDecimal giaHienTai;

  @Column(name = "istopping", nullable = false)
  private Boolean isTopping;

  @Column(name = "trangthai", nullable = false)
  private Integer trangThai;

  @Column(name = "createdat")
  private LocalDateTime createdAt;

  @Column(name = "updatedat")
  private LocalDateTime updatedAt;

  @PrePersist
  public void prePersist() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;

    if (this.trangThai == null) {
      this.trangThai = 1;
    }

    if (this.isTopping == null) {
      this.isTopping = false;
    }
  }

  @PreUpdate
  public void preUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}