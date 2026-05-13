package com.phungloccoffee.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventorytransaction")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransaction {

    @Id
    @Column(name = "matrans", length = 50)
    private String maTrans;

    @Column(name = "macn", length = 20)
    private String maCN;

    @Column(name = "manl", length = 50)
    private String maNL;

    @Column(name = "malo", length = 50)
    private String maLo; 

    @Column(name = "loaichungtu", length = 20)
    private String loaiChungTu;

    @Column(name = "idchungtu", length = 50)
    private String idChungTu;

    @Column(name = "loaigiaodich", length = 30)
    private String loaiGiaoDich;

    @Column(name = "soluong")
    private Double soLuong;

    @Column(name = "trangthai", length = 30)
    private String trangThai;

    @Column(name = "issynced")
    private Boolean isSynced;

    @Column(name = "createdat")
    private LocalDateTime createdAt;
}
