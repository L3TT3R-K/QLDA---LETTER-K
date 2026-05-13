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
import java.math.BigDecimal;

@Entity
@Table(name = "phieunhap")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PhieuNhap {

    @Id
    @Column(name = "mapn", length = 50)
    private String maPN;

    @ManyToOne
    @JoinColumn(name = "mancc")
    private NhaCungCap nhaCungCap;

    @ManyToOne
    @JoinColumn(name = "macn")
    private ChiNhanh chiNhanh;

    @ManyToOne
    @JoinColumn(name = "manv")
    private NhanVien nhanVien;

    @Column(name = "ngaynhap")
    private LocalDateTime ngayNhap;

    @Column(name = "tongtien", columnDefinition = "numeric")
    private BigDecimal tongTien;

    @Column(name = "trangthai", length = 30)
    private String trangThai;

    @Column(name = "daxulykho")
    private Boolean daXuLyKho;

    @Column(name = "issynced")
    private Boolean isSynced;

    @CreationTimestamp
    @Column(name = "createdat", updatable = false)
    private LocalDateTime createdAt;
}
