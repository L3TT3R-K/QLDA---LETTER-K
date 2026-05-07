package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.CaLamViec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface CaLamViecRepository extends JpaRepository<CaLamViec, String>{
}