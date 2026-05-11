package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.CTPhieuDieuChuyenKho;
import com.phungloccoffee.backend.entity.CTPhieuDieuChuyenKhoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CTPhieuDieuChuyenKhoRepository extends JpaRepository<CTPhieuDieuChuyenKho, CTPhieuDieuChuyenKhoId> {
    List<CTPhieuDieuChuyenKho> findByMaPC(String maPC);
}
