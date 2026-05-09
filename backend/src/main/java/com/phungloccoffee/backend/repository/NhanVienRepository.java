package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository

public interface NhanVienRepository extends JpaRepository<NhanVien, String>{
    // Spring Data JPA sẽ tự động hiểu lệnh này là: SELECT * FROM nhanvien WHERE username = ?
    Optional<NhanVien> findByUsername(String username);
}