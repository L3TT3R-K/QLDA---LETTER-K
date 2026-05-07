package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.SanPhamRequest;
import com.phungloccoffee.backend.entity.SanPham;
import com.phungloccoffee.backend.repository.SanPhamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SanPhamService {

  private final SanPhamRepository sanPhamRepository;

  public List<SanPham> getAll() {
    return sanPhamRepository.findAll();
  }

  public SanPham getById(String maSP) {
    return sanPhamRepository.findById(maSP)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm: " + maSP));
  }

  public SanPham create(SanPhamRequest request) {
    if (request.getMaSP() == null || request.getMaSP().isBlank()) {
      throw new RuntimeException("Mã sản phẩm không được để trống");
    }

    if (sanPhamRepository.existsById(request.getMaSP())) {
      throw new RuntimeException("Mã sản phẩm đã tồn tại: " + request.getMaSP());
    }

    SanPham sanPham = SanPham.builder()
            .maSP(request.getMaSP())
            .tenSP(request.getTenSP())
            .giaHienTai(request.getGiaHienTai())
            .isTopping(request.getIsTopping())
            .trangThai(request.getTrangThai())
            .build();

    return sanPhamRepository.save(sanPham);
  }

  public SanPham update(String maSP, SanPhamRequest request) {
    SanPham sanPham = getById(maSP);

    sanPham.setTenSP(request.getTenSP());
    sanPham.setGiaHienTai(request.getGiaHienTai());
    sanPham.setIsTopping(request.getIsTopping());
    sanPham.setTrangThai(request.getTrangThai());

    return sanPhamRepository.save(sanPham);
  }

  public void delete(String maSP) {
    SanPham sanPham = getById(maSP);

    // Nên xóa mềm vì sản phẩm có thể đã nằm trong hóa đơn/công thức
    sanPham.setTrangThai(0);

    sanPhamRepository.save(sanPham);
  }

  public List<SanPham> getByTrangThai(Integer trangThai) {
    return sanPhamRepository.findByTrangThai(trangThai);
  }

  public List<SanPham> getByIsTopping(Boolean isTopping) {
    return sanPhamRepository.findByIsTopping(isTopping);
  }
}
