package com.phungloccoffee.backend.repository;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.phungloccoffee.backend.entity.KiemKho;

public interface KiemKhoRepository extends JpaRepository<KiemKho, String> {
    List<KiemKho> findByChiNhanh_MaCNAndNgayKiemBetween(String maCN, LocalDateTime tuNgay, LocalDateTime denNgay);
}