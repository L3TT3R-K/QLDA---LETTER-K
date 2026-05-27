package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.PhieuXuatKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PhieuXuatKhoRepository extends JpaRepository<PhieuXuatKho, String> {
    List<PhieuXuatKho> findByChiNhanhMaCN(String maCN);
    List<PhieuXuatKho> findByCreatedAtBetween(LocalDateTime tuNgay, LocalDateTime denNgay);
    List<PhieuXuatKho> findByChiNhanhMaCNAndCreatedAtBetween(String maCN, LocalDateTime tuNgay, LocalDateTime denNgay);
}
