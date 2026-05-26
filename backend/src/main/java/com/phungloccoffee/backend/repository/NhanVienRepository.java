package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

    @Repository
    public interface NhanVienRepository extends JpaRepository<NhanVien, String> {
        Optional<NhanVien> findByUsername(String username);
        boolean existsByUsername(String username);

    @Query(value = """
        SELECT 
            nv.manv, nv.username, nv.tennv, nv.chucvu, 
            cn.tencn, nv.trangthai 
        FROM nhanvien nv
        LEFT JOIN chinhanh cn ON nv.macn = cn.macn
        """, nativeQuery = true)
    List<Object[]> findAllCustom();
}