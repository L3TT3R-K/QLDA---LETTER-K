package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "tonkho")
@IdClass(TonKho_ID.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TonKho {

    @Id
    @Column(name = "macn", length = 20)
    private String maCN;

    @Id
    @Column(name = "manl", length = 50)
    private String maNL;

    @Column(name = "soluongton")
    private Double soLuongTon;
}