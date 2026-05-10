package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "ctkk")
@IdClass(CTKK_ID.class) // Khai báo sử dụng khóa chính kép từ file CTKKID
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CTKK {

    @Id // Khóa chính thứ nhất
    @Column(name = "makk", length = 50)
    private String maKK;

    @Id // Khóa chính thứ hai
    @Column(name = "manl", length = 50)
    private String maNL;

    @Column(name = "soluonghethong")
    private Double soLuongHeThong;

    @Column(name = "soluongthucte")
    private Double soLuongThucTe;

    @Column(name = "chenhlech")
    private Double chenhLech;
}