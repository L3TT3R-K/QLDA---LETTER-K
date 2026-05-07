package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "DINHMUCCONGTHUC")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DinhMucCongThuc {

  @EmbeddedId
  private DinhMucCongThucId id;

  @Column(name = "SoLuong", nullable = false, precision = 18, scale = 4)
  private BigDecimal soLuong;
}
