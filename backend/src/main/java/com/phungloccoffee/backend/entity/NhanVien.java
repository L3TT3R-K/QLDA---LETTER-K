package com.phungloccoffee.backend.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
@Table(name = "nhanvien")
@Getter
@Setter
@NoArgsConstructor 
@AllArgsConstructor


public class NhanVien {
    @Id
    @Column(name = "manv", length = 50)
    private String maNV;

    @Column(name = "username", length = 50, unique = true)
    private String userName; 

    @Column(name = "passwordhash", length = 255)
    private String passwordHash; 

    @Column(name = "tennv", length = 100)
    private String tenNV; 

    @Column(name = "chucvu", length = 20)
    private String chucVu; 

    @ManyToOne
    @JoinColumn(name = "macn")
    private ChiNhanh chiNhanh; 

    @Column(name = "trangthai", length = 30)
    private String trangThai;
    
    @CreationTimestamp
    @Column(name = "createdat", updatable = false) //updatable = Không được update sau khi tạo
    private LocalDateTime createdAt; 

    @UpdateTimestamp
    @Column(name = "updatedat")
    private LocalDateTime updatedAt; 
}
