package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.DinhMucCongThuc;
import com.phungloccoffee.backend.entity.DinhMucCongThucId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DinhMucCongThucRepository extends JpaRepository<DinhMucCongThuc, DinhMucCongThucId> {

  List<DinhMucCongThuc> findByIdMaPB(String maPB);

  List<DinhMucCongThuc> findByIdMaNL(String maNL);

  void deleteByIdMaPB(String maPB);
}
