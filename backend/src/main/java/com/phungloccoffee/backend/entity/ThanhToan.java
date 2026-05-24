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
@Table(name = "thanhtoan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ThanhToan {
    @Id
    @Column(name = "matt", length = 50)
    private String maTT;

    @ManyToOne
    @JoinColumn(name = "mahd")
    private HoaDon hoaDon;

    @Column(name = "phuongthuc", length = 50)
    private String phuongThuc;

    @Column(name = "sotien")
    private BigDecimal soTien;

    @Column(name = "trangthai")
    private Integer trangThai;

    @Column(name = "issynced")
    private Boolean isSynced;

    @CreationTimestamp
    @Column(name = "createdat", updatable = false)
    private LocalDateTime createdAt;
}
