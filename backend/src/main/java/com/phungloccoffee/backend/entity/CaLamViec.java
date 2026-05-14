package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "calamviec")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaLamViec {

    @Id
    @Column(name = "maca")
    private String maCa;

    @Column(name = "manv")
    private String maNV;

    @Column(name = "macn")
    private String maCN;

    @Column(name = "thoigianmo")
    private LocalDateTime thoiGianMo;

    @Column(name = "thoigiandong")
    private LocalDateTime thoiGianDong;

    @Column(name = "tiendauca")
    private BigDecimal tienDauCa;

    @Column(name = "tiencuoica")
    private BigDecimal tienCuoiCa;

    @Column(name = "sotienthatthoat")
    private BigDecimal soTienThatThoat;

    @Column(name = "lydogiaitrinh")
    private String lyDoGiaiTrinh;

    @Column(name = "issynced")
    private Boolean isSynced;

    @Column(name = "createdat")
    private LocalDateTime createdAt;
    
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.isSynced == null) {
            this.isSynced = false;
        }
    }
}