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
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "phieuxuat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PhieuXuatKho {

    @Id
    @Column(name = "mapx", length = 50)
    private String maPX;

    @ManyToOne
    @JoinColumn(name = "macn")
    private ChiNhanh chiNhanh;

    @ManyToOne
    @JoinColumn(name = "manv")
    private NhanVien nhanVien;

    @Column(name = "lydo", length = 255)
    private String lyDo;

    @Column(name = "trangthai")
    private Integer trangThai;

    @Column(name = "issynced")
    private Boolean isSynced;

    @CreationTimestamp
    @Column(name = "createdat", updatable = false)
    private LocalDateTime createdAt;
}
