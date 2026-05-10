package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, String> {
}