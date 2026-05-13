package com.phungloccoffee.backend.repository;
import com.phungloccoffee.backend.entity.SanPham;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SanPhamRepository extends JpaRepository<SanPham, String> {

  boolean existsByTenSPIgnoreCase(String tenSP);

  List<SanPham> findByTrangThai(String trangThai);

  List<SanPham> findByIsTopping(Boolean isTopping);
}
