package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chinhanh")
@Getter
@Setter
@NoArgsConstructor    
@AllArgsConstructor   
@Builder              
public class ChiNhanh {

    @Id
    @Column(name = "macn")
    private String maCN;

    @Column(name = "tencn")
    private String tenCN;

    @Column(name = "diachi")
    private String diaChi;

    @Column(name = "trangthai")
    private Integer trangThai;

    @Column(name = "createdat")
    private LocalDateTime createdAt;

    @Column(name = "updatedat")
    private LocalDateTime updatedAt;
}