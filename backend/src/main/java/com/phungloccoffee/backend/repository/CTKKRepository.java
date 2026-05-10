package com.phungloccoffee.backend.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.phungloccoffee.backend.entity.CTKK;
import com.phungloccoffee.backend.entity.CTKK_ID;

public interface CTKKRepository extends JpaRepository<CTKK, CTKK_ID> {
    //Lấy chi tiết đếm kho của 1 mã phiếu kiểm
    List<CTKK> findByMaKK(String maKK);
}