package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "SANPHAM")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SanPham {

  @Id
  @Column(name = "MaSP", length = 50)
  private String maSP;

  @Column(name = "TenSP", nullable = false, length = 150)
  private String tenSP;

  @Column(name = "GiaHienTai", nullable = false, precision = 18, scale = 0)
  private BigDecimal giaHienTai;

  @Column(name = "IsTopping", nullable = false)
  private Boolean isTopping;

  @Column(name = "TrangThai", nullable = false)
  private Integer trangThai;

  @Column(name = "CreatedAt")
  private LocalDateTime createdAt;

  @Column(name = "UpdatedAt")
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
