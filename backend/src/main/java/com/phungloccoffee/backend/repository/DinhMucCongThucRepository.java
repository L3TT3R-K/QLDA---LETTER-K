package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.DinhMucCongThuc;
import com.phungloccoffee.backend.entity.DinhMucCongThucId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DinhMucCongThucRepository extends JpaRepository<DinhMucCongThuc, DinhMucCongThucId> {

  List<DinhMucCongThuc> findByIdMaPB(String maPB);

  List<DinhMucCongThuc> findByIdMaNL(String maNL);

  void deleteByIdMaPB(String maPB);
  @Query(value = "SELECT d.manl, n.tennl, n.donvicoban, d.soluong " +
                   "FROM dinhmuccongthuc d " +
                   "JOIN nguyenlieu n ON d.manl = n.manl " +
                   "WHERE d.mapb = ?1", nativeQuery = true)
  List<Object[]> findChiTietByMaPB(String maPB);
}
