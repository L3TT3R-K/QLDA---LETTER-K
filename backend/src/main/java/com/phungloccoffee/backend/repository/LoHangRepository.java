package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.LoHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoHangRepository extends JpaRepository<LoHang, String> {
    List<LoHang> findByChiNhanhMaCN(String maCN);
    List<LoHang> findByNguyenLieuMaNLAndChiNhanhMaCN(String maNL, String maCN);
}
