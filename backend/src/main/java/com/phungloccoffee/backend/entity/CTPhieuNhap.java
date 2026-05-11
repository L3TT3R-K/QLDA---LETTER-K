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
@Table(name = "ctpn")
@IdClass(CTPhieuNhapId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CTPhieuNhap {

    @Id
    @Column(name = "mapn", length = 50)
    private String maPN;

    @Id
    @Column(name = "malo", length = 50)
    private String maLo;

    @Column(name = "soluong", columnDefinition = "numeric")
    private BigDecimal soLuong;

    @Column(name = "dongianhap", columnDefinition = "numeric")
    private BigDecimal donGiaNhap;

    @Column(name = "thanhtien", columnDefinition = "numeric")
    private BigDecimal thanhTien;
}
