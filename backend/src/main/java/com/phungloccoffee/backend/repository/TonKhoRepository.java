package com.phungloccoffee.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.phungloccoffee.backend.entity.TonKho;
import com.phungloccoffee.backend.entity.TonKho_ID;

public interface TonKhoRepository extends JpaRepository<TonKho, TonKho_ID> {
    //Hàm tìm kiếm số lượng tồn kho hiện tại
    TonKho findByMaCNAndMaNL(String maCN, String maNL);
}