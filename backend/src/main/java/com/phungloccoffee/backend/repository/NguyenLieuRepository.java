package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.NguyenLieu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NguyenLieuRepository extends JpaRepository<NguyenLieu, String> {
    @Query(value = "SELECT manl, tennl, donvicoban, tontoithieu, trangthai FROM nguyenlieu", nativeQuery = true)
    List<Object[]> findAllCustom();
}