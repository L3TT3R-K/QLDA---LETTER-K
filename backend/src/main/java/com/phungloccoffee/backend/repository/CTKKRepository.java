package com.phungloccoffee.backend.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.phungloccoffee.backend.entity.CTKK;
import com.phungloccoffee.backend.entity.CTKK_ID;

public interface CTKKRepository extends JpaRepository<CTKK, CTKK_ID> {
    //Lấy chi tiết đếm kho của 1 mã phiếu kiểm
    List<CTKK> findByMaKK(String maKK);
    @Query(value = "SELECT k.makk, k.ngaykiem, c.manl, n.tennl, n.donvicoban, c.soluonghethong, c.soluongthucte, c.chenhlech, cn.tencn, nv.tennv, k.issynced " +
                   "FROM ctkk c " +
                   "JOIN kiemkho k ON c.makk = k.makk " +
                   "JOIN nguyenlieu n ON c.manl = n.manl " +
                   "JOIN chinhanh cn ON k.macn = cn.macn " +
                   "JOIN nhanvien nv ON k.manv = nv.manv " +
                   "ORDER BY k.ngaykiem DESC", nativeQuery = true)
    List<Object[]> findAllChiTietKiemKho();
}