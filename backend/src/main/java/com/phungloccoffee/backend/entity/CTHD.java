package com.phungloccoffee.backend.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cthd")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class CTHD {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @ManyToOne
    @JoinColumn(name = "mahd")
    private HoaDon hoaDon;

    @ManyToOne
    @JoinColumn(name = "masp")
    private SanPham sanPham;

    @Column(name = "soluong")
    private Integer soLuong;

    @Column(name = "giabantaitheodiem")
    private BigDecimal giaBanTaiThoiDiem;

    @Column(name = "ghichu", length = 255)
    private String ghiChu;

    @Column(name = "idmonchinh", length = 50)
    private String idMonChinh;
}