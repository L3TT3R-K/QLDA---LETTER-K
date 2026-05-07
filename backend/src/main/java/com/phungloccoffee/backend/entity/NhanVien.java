package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.Getter; 
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

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

    @Column(name = "trangthai")
    private Integer trangThai;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false) // updatable = Không được update sau khi tạo
    private LocalDateTime createdAt; 

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt; 
}
