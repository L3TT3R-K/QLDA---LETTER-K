package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "nhanvien")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhanVien {

    @Id
    @Column(name = "manv")
    private String maNV;

    @Column(name = "username", unique = true)
    private String username;

    @Column(name = "passwordhash")
    private String passwordHash;

    @Column(name = "tennv")
    private String tenNV;

    @Column(name = "chucvu")
    private String chucVu;

    @Column(name = "macn")
    private String maCN;

    @Column(name = "trangthai")
    private Integer trangThai;

    @Column(name = "createdat")
    private LocalDateTime createdAt;

    @Column(name = "updatedat")
    private LocalDateTime updatedAt;
}