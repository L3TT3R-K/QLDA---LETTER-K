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
@Table(name = "nguyenlieu")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class NguyenLieu {
    @Id
    @Column(name = "manl", length = 50)
    private String maNL;

    @Column(name = "tennl", length = 150)
    private String tenNL;

    @Column(name = "tontoithieu")
    private Double tonToiThieu;

    @ManyToOne
    @JoinColumn(name = "donvicoban")
    private DonVi donViCoBan;

    @Column(name = "trangthai")
    private Integer trangThai;

    @CreationTimestamp
    @Column(name = "createdat", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updatedat")
    private LocalDateTime updatedAt;
}
