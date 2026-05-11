package com.phungloccoffee.backend.entity;

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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "lohang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoHang {

    @Id
    @Column(name = "malo", length = 50)
    private String maLo;

    @ManyToOne
    @JoinColumn(name = "manl")
    private NguyenLieu nguyenLieu;

    @ManyToOne
    @JoinColumn(name = "macn")
    private ChiNhanh chiNhanh;

    @Column(name = "ngaynhap")
    private LocalDateTime ngayNhap;

    @Column(name = "hsd")
    private LocalDate hanSuDung;

    @Column(name = "soluongcon", columnDefinition = "numeric")
    private BigDecimal soLuongCon;

    @Column(name = "issynced")
    private Boolean isSynced;
}
