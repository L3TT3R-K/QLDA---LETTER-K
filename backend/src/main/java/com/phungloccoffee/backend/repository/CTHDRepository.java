package com.phungloccoffee.backend.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.phungloccoffee.backend.entity.CTHD;
import com.phungloccoffee.backend.entity.HoaDon;

@Repository
public interface CTHDRepository extends JpaRepository<CTHD, String> {
    List<CTHD> findByHoaDon(HoaDon hoaDon);
}