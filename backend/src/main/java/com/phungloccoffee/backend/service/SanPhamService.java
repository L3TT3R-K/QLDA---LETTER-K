package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.SanPhamRequest;
import com.phungloccoffee.backend.entity.SanPham;
import com.phungloccoffee.backend.repository.SanPhamRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.phungloccoffee.backend.service.AuditLogService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SanPhamService {

  private final SanPhamRepository sanPhamRepository;

  private final AuditLogService auditLogService;

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
    
    SanPham sanPhamMoi = sanPhamRepository.save(sanPham);
    auditLogService.ghiLog("NV_ADMIN", "SANPHAM", sanPhamMoi.getMaSP(), "INSERT", null, sanPhamMoi);

    return sanPhamMoi;
  }

  public SanPham update(String maSP, SanPhamRequest request) {
    SanPham sanPham = getById(maSP);

    SanPham banSaoCu = SanPham.builder()
                .maSP(sanPham.getMaSP())
                .tenSP(sanPham.getTenSP())
                .giaHienTai(sanPham.getGiaHienTai())
                .isTopping(sanPham.getIsTopping())
                .trangThai(sanPham.getTrangThai())
                .build();

    sanPham.setTenSP(request.getTenSP());
    sanPham.setGiaHienTai(request.getGiaHienTai());
    sanPham.setIsTopping(request.getIsTopping());
    sanPham.setTrangThai(request.getTrangThai());

    SanPham sanPhamMoi = sanPhamRepository.save(sanPham);
    auditLogService.ghiLog("NV_ADMIN", "SANPHAM", maSP, "UPDATE", banSaoCu, sanPhamMoi);

    return sanPhamMoi;
  }

  public void delete(String maSP) {
    SanPham sanPham = getById(maSP);

    SanPham banSaoCu = SanPham.builder()
                .maSP(sanPham.getMaSP())
                .tenSP(sanPham.getTenSP())
                .giaHienTai(sanPham.getGiaHienTai())
                .isTopping(sanPham.getIsTopping())
                .trangThai(sanPham.getTrangThai())
                .build();

    // Nên xóa mềm vì sản phẩm có thể đã nằm trong hóa đơn/công thức
    sanPham.setTrangThai("Ngừng hoạt động");

    SanPham sanPhamMoi = sanPhamRepository.save(sanPham);
    auditLogService.ghiLog("NV_ADMIN", "SANPHAM", maSP, "DELETE (SOFT)", banSaoCu, sanPhamMoi);
  }

  public List<SanPham> getByTrangThai(String trangThai) {
    return sanPhamRepository.findByTrangThai(trangThai);
  }

  public List<SanPham> getByIsTopping(Boolean isTopping) {
    return sanPhamRepository.findByIsTopping(isTopping);
  }
}
