package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "donvi")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DonVi {
    @Id
    @Column(name = "madv", length = 20)
    private String maDV;

    @Column(name = "tendonvi", length = 50)
    private String tenDonVi;

    @Column(name = "trangthai")
    private Integer trangThai;

    @CreationTimestamp
    @Column(name = "createdat", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updatedat")
    private LocalDateTime updatedAt;
}