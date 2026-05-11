package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.CTPhieuNhap;
import com.phungloccoffee.backend.entity.CTPhieuNhapId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CTPhieuNhapRepository extends JpaRepository<CTPhieuNhap, CTPhieuNhapId> {
    List<CTPhieuNhap> findByMaPN(String maPN);
}
