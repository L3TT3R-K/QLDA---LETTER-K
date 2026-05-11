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
@Table(name = "phieuchuyen")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PhieuDieuChuyenKho {

    @Id
    @Column(name = "mapc", length = 50)
    private String maPC;

    @Column(name = "macn_xuat", length = 20)
    private String maCNXuat;

    @Column(name = "macn_nhap", length = 20)
    private String maCNNhap;

    @ManyToOne
    @JoinColumn(name = "manv")
    private NhanVien nhanVien;

    @Column(name = "trangthai")
    private Integer trangThai;

    @Column(name = "issynced")
    private Boolean isSynced;

    @CreationTimestamp
    @Column(name = "createdat", updatable = false)
    private LocalDateTime createdAt;
}
