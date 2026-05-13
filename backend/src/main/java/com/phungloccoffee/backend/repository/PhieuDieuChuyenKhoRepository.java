package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.PhieuDieuChuyenKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhieuDieuChuyenKhoRepository extends JpaRepository<PhieuDieuChuyenKho, String> {
    List<PhieuDieuChuyenKho> findByMaCNXuatOrMaCNNhap(String maCNXuat, String maCNNhap);
    List<PhieuDieuChuyenKho> findByTrangThai(String trangThai);
}
