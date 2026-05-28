package com.phungloccoffee.backend.repository;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.phungloccoffee.backend.entity.CTHD;
import com.phungloccoffee.backend.entity.HoaDon;
import com.phungloccoffee.backend.dto.DoanhThuSanPhamResponse;

@Repository
public interface CTHDRepository extends JpaRepository<CTHD, String> {
    List<CTHD> findByHoaDon(HoaDon hoaDon);

    @Query(value = "SELECT c.masp AS maSP, s.tensp AS tenSP, " +
                   "SUM(c.soluong) AS tongSoLuongBan, " +
                   "SUM(c.soluong * COALESCE(c.giabantaitheodiem, c.giabantaithoidiem, 0)) AS tongDoanhThu " +
                   "FROM cthd c " +
                   "JOIN hoadon h ON c.mahd = h.mahd " +
                   "JOIN sanpham s ON c.masp = s.masp " +
                   "WHERE h.trangthai = 1 AND h.macn = :maCN " +
                   "AND h.createdat >= :tuNgay AND h.createdat <= :denNgay " +
                   "GROUP BY c.masp, s.tensp " +
                   "ORDER BY tongDoanhThu DESC", 
           nativeQuery = true)
    List<DoanhThuSanPhamResponse> thongKeDoanhThuTheoSanPham(
            @Param("maCN") String maCN,
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
}
