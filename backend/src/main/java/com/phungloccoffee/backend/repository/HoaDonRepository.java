package com.phungloccoffee.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.phungloccoffee.backend.entity.HoaDon;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, String> {
}