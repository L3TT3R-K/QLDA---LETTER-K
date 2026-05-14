package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donvi")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonVi {

    @Id
    @Column(name = "madv")
    private String maDV;

    @Column(name = "tendonvi")
    private String tenDonVi;

    @Column(name = "trangthai")
    private Integer trangThai;

    @Column(name = "createdat")
    private LocalDateTime createdAt;

    @Column(name = "updatedat")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.trangThai == null) this.trangThai = 1;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}