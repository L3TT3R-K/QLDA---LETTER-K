package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NhanVienRepository extends JpaRepository<NhanVien, String> {
    Optional<NhanVien> findByUsername(String username);
    boolean existsByUsername(String username);
}