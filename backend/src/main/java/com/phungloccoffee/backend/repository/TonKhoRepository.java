package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.TonKho;
import com.phungloccoffee.backend.entity.TonKho_ID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TonKhoRepository extends JpaRepository<TonKho, TonKho_ID> {
}