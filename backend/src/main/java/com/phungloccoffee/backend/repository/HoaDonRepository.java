package com.phungloccoffee.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.phungloccoffee.backend.entity.HoaDon;
import com.phungloccoffee.backend.dto.DoanhThuChiNhanhResponse;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, String> {

    @Query(value = "SELECT macn AS maCN, SUM(tongtien) AS tongDoanhThu, COUNT(mahd) AS soLuongDon " +
                   "FROM hoadon " +
                   "WHERE trangthai = 1 AND createdat >= :tuNgay AND createdat <= :denNgay " +
                   "GROUP BY macn", 
           nativeQuery = true)
    List<DoanhThuChiNhanhResponse> thongKeDoanhThuTheoChiNhanh(
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
}