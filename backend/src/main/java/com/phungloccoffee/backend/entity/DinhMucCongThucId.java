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

  @Column(name = "mapb", length = 50)
  private String maPB;

  @Column(name = "manl", length = 50)
  private String maNL;
}
