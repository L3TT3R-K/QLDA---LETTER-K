package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.PhienBanCongThuc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PhienBanCongThucRepository extends JpaRepository<PhienBanCongThuc, String> {

  List<PhienBanCongThuc> findByMaSP(String maSP);

  Optional<PhienBanCongThuc> findByMaSPAndTrangThai(String maSP, Integer trangThai);

  List<PhienBanCongThuc> findAllByMaSPAndTrangThai(String maSP, Integer trangThai);
}
