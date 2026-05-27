package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, String> {
    @Query("SELECT t FROM InventoryTransaction t " +
            "WHERE (:maCN IS NULL OR t.maCN = :maCN) " +
            "AND (t.isSynced = false OR t.trangThai = 0) " +
            "ORDER BY t.createdAt DESC")
    List<InventoryTransaction> findCanhBaoDongBo(@Param("maCN") String maCN);

    List<InventoryTransaction> findByLoaiChungTuAndIdChungTu(String loaiChungTu, String idChungTu);
}
