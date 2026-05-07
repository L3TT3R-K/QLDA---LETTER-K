package com.phungloccoffee.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class DinhMucCongThucId implements Serializable {

  @Column(name = "MaPB", length = 50)
  private String maPB;

  @Column(name = "MaNL", length = 50)
  private String maNL;
}
