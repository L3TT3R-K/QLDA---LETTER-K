package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.DonVi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DonViRepository extends JpaRepository<DonVi, String> {
}