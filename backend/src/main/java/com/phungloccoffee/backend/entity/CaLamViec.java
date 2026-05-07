package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "calamviec")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CaLamViec {

    @Id
    @Column(name = "maca", length = 50)
    private String maCa;

    @ManyToOne 
    @JoinColumn(name = "manv") 
    private NhanVien nhanVien; 

    @Column(name = "ngaylamviec")
    private LocalDate ngayLamViec;

    @Column(name = "giobatdau")
    private LocalTime gioBatDau; 

    @Column(name = "gioketthuc")
    private LocalTime gioKetThuc;

    @Column(name = "trangthai") 
    private Integer trangThai;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}