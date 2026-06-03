package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.ChiNhanh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiNhanhRepository extends JpaRepository<ChiNhanh, String> {
    List<ChiNhanh> findByTrangThai(Integer trangThai);
    boolean existsByTenCNIgnoreCase(String tenCN);
    boolean existsByTenCNIgnoreCaseAndMaCNNot(String tenCN, String maCN);
}
