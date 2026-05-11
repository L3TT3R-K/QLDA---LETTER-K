package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.CTPhieuXuatKho;
import com.phungloccoffee.backend.entity.CTPhieuXuatKhoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CTPhieuXuatKhoRepository extends JpaRepository<CTPhieuXuatKho, CTPhieuXuatKhoId> {
    List<CTPhieuXuatKho> findByMaPX(String maPX);
}
