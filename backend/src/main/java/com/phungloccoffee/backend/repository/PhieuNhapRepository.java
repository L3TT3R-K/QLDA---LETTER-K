package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.PhieuNhap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhieuNhapRepository extends JpaRepository<PhieuNhap, String> {
    List<PhieuNhap> findByNhaCungCapMaNCC(String maNCC);
    List<PhieuNhap> findByNhaCungCapMaNCCAndChiNhanhMaCN(String maNCC, String maCN);
    List<PhieuNhap> findByChiNhanhMaCN(String maCN);
}
