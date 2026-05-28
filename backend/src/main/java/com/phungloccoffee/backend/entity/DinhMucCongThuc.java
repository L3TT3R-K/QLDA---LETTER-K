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

  @Column(name = "so_luong", nullable = false, precision = 18, scale = 4)
  private BigDecimal soLuong;
}
