package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.CaLamViec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaLamViecRepository extends JpaRepository<CaLamViec, String> {
    List<CaLamViec> findByMaCNAndThoiGianDongIsNull(String maCN);
}