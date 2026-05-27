package com.phungloccoffee.backend.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.phungloccoffee.backend.entity.TonKho;
import com.phungloccoffee.backend.entity.TonKho_ID;

public interface TonKhoRepository extends JpaRepository<TonKho, TonKho_ID> {
    //Hàm tìm kiếm số lượng tồn kho hiện tại
    TonKho findByMaCNAndMaNL(String maCN, String maNL);
    //Lấy toàn bộ nguyên liệu trong kho của 1 chi nhánh
    List<TonKho> findByMaCN(String maCN);

    @Query(value = """
        SELECT 
            nl.manl as maNL, 
            nl.tennl as tenNguyenLieu, 
            dv.tendonvi as donVi, 
            cn.macn as maCN, 
            cn.tencn as chiNhanh, 
            tk.soluongton as tonHienTai, 
            nl.tontoithieu as tonToiThieu 
        FROM tonkho tk
        JOIN nguyenlieu nl ON tk.manl = nl.manl
        JOIN donvi dv ON nl.donvicoban = dv.madv
        JOIN chinhanh cn ON tk.macn = cn.macn
        """, nativeQuery = true)
    List<Object[]> layDanhSachTonKho();

    @Query(value = """
        SELECT 
            nl.manl as maNL, 
            nl.tennl as tenNguyenLieu, 
            dv.tendonvi as donVi, 
            cn.macn as maCN, 
            cn.tencn as chiNhanh, 
            tk.soluongton as tonHienTai, 
            nl.tontoithieu as tonToiThieu 
        FROM tonkho tk
        JOIN nguyenlieu nl ON tk.manl = nl.manl
        JOIN donvi dv ON nl.donvicoban = dv.madv
        JOIN chinhanh cn ON tk.macn = cn.macn
        WHERE tk.macn = :maCN
        """, nativeQuery = true)
    List<Object[]> layDanhSachTonKhoTheoChiNhanh(@Param("maCN") String maCN);
}
