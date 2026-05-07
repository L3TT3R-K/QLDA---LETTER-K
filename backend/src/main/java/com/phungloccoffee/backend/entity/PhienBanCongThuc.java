package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "PHIENBANCONGTHUC")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhienBanCongThuc {

  @Id
  @Column(name = "MaPB", length = 50)
  private String maPB;

  @Column(name = "MaSP", nullable = false, length = 50)
  private String maSP;

  @Column(name = "NgayHieuLuc", nullable = false)
  private LocalDateTime ngayHieuLuc;

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
  }

  @PreUpdate
  public void preUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
