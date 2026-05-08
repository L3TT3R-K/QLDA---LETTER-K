package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

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
}