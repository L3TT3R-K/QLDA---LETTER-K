package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "phienbancongthuc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhienBanCongThuc {

  @Id
  @Column(name = "mapb", length = 50)
  private String maPB;

  @Column(name = "masp", nullable = false, length = 50)
  private String maSP;

  @Column(name = "ngay_hieu_luc", nullable = false)
  private LocalDateTime ngayHieuLuc;

  @Column(name = "trang_thai", nullable = false)
  private Integer trangThai;

  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  public void prePersist() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;

    if (this.trangThai == null) {
      this.trangThai = 1;
    }
  }

  @PreUpdate
  public void preUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
