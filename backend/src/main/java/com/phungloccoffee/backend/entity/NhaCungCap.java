package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "nhacungcap")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class NhaCungCap {
    @Id
    @Column(name = "mancc", length = 50)
    private String maNCC;

    @Column(name = "tenncc", length = 150)
    private String tenNCC;

    @Column(name = "trangthai")
    private Integer trangThai;

    @CreationTimestamp
    @Column(name = "createdat", updatable = false)
    private LocalDateTime createdAt;
}