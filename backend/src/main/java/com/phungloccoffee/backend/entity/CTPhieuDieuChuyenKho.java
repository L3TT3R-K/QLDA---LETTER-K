package com.phungloccoffee.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "ctpc")
@IdClass(CTPhieuDieuChuyenKhoId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CTPhieuDieuChuyenKho {

    @Id
    @Column(name = "mapc", length = 50)
    private String maPC;

    @Id
    @Column(name = "malo", length = 50)
    private String maLo;

    @Column(name = "soluong", columnDefinition = "numeric")
    private BigDecimal soLuong;
}
