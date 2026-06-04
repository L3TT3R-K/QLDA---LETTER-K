package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "dinhmuccongthuc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DinhMucCongThuc {

  @EmbeddedId
  private DinhMucCongThucId id;

  @Column(name = "soluong", nullable = false, precision = 18, scale = 4)
  private BigDecimal soLuong;

  @ManyToOne
  @JoinColumn(name = "mapb", insertable = false, updatable = false)
  private PhienBanCongThuc phienBanCongThuc;

  @ManyToOne
  @JoinColumn(name = "manl", insertable = false, updatable = false)
  private NguyenLieu nguyenLieu;
}