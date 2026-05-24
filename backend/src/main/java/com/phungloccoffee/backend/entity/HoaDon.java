package com.phungloccoffee.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

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
@Table(name = "hoadon")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class HoaDon {

    @Id
    @Column(name = "mahd", length = 50)
    private String maHD;

    @Column(name = "maca", length = 50)
    private String maCa;

    @ManyToOne
    @JoinColumn(name = "macn")
    private ChiNhanh chiNhanh;

    @Column(name = "tongtien")
    private BigDecimal tongTien;

    @Column(name = "giamgia")
    private BigDecimal giamGia;

    @CreationTimestamp
    @Column(name = "createdat", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "trangthai")
    private Integer trangThai;

    @Column(name = "issynced")
    private Boolean isSynced;
}
