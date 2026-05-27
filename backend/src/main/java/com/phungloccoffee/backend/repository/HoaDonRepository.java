package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.dto.DoanhThuChiNhanhResponse;
import com.phungloccoffee.backend.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, String> {

    @Query(value = "SELECT c.macn AS maCN, c.tencn AS tenCN, COUNT(h.mahd) AS soLuongDon, SUM(h.tongtien) AS tongDoanhThu " +
                   "FROM hoadon h " +
                   "JOIN chinhanh c ON h.macn = c.macn " +
                   "WHERE h.createdat >= :tuNgay AND h.createdat <= :denNgay AND h.trangthai = 1 " +
                   "GROUP BY c.macn, c.tencn " +
                   "ORDER BY tongDoanhThu DESC", nativeQuery = true)
    List<DoanhThuChiNhanhResponse> thongKeDoanhThuTheoChiNhanh(@Param("tuNgay") LocalDateTime tuNgay, 
                                                               @Param("denNgay") LocalDateTime denNgay);
}