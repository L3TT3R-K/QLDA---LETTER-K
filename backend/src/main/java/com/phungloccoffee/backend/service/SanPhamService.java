package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.SanPhamRequest;
import com.phungloccoffee.backend.entity.SanPham;
import com.phungloccoffee.backend.repository.SanPhamRepository;
import com.phungloccoffee.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SanPhamService {

  private final SanPhamRepository sanPhamRepository;
  private final AuditLogService auditLogService;

  private void requireAdminAccess() {
      if (!SecurityUtils.canAccessAllBranches()) {
          throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ Admin mới có quyền thao tác dữ liệu hệ thống");
      }
  }

  public List<SanPham> getAll() {
    return sanPhamRepository.findAll(); 
  }

  public SanPham getById(String maSP) {
    return sanPhamRepository.findById(maSP)
        .orElseThrow(() -> new RuntimeException("Khong tim thay san pham: " + maSP));
  }

  public SanPham create(SanPhamRequest request) {
    requireAdminAccess(); 
    if (request.getMaSP() == null || request.getMaSP().isBlank()) throw new RuntimeException("Ma san pham khong duoc de trong");
    if (sanPhamRepository.existsById(request.getMaSP())) throw new RuntimeException("Ma san pham da ton tai: " + request.getMaSP());

    SanPham sanPham = SanPham.builder().maSP(request.getMaSP()).tenSP(request.getTenSP()).giaHienTai(request.getGiaHienTai()).isTopping(request.getIsTopping()).trangThai(request.getTrangThai() == null ? 1 : request.getTrangThai()).build();
    SanPham saved = sanPhamRepository.save(sanPham);
    auditLogService.ghiLog(null, "SANPHAM", saved.getMaSP(), "INSERT", null, saved);
    return saved;
  }

  public SanPham update(String maSP, SanPhamRequest request) {
    requireAdminAccess(); 
    SanPham sanPham = getById(maSP);
    SanPham oldValue = SanPham.builder().maSP(sanPham.getMaSP()).tenSP(sanPham.getTenSP()).giaHienTai(sanPham.getGiaHienTai()).isTopping(sanPham.getIsTopping()).trangThai(sanPham.getTrangThai()).build();

    sanPham.setTenSP(request.getTenSP());
    sanPham.setGiaHienTai(request.getGiaHienTai());
    sanPham.setIsTopping(request.getIsTopping());
    sanPham.setTrangThai(request.getTrangThai());

    SanPham saved = sanPhamRepository.save(sanPham);
    auditLogService.ghiLog(null, "SANPHAM", maSP, "UPDATE", oldValue, saved);
    return saved;
  }

  public void delete(String maSP) {
    requireAdminAccess(); 
    SanPham sanPham = getById(maSP);
    SanPham oldValue = SanPham.builder().maSP(sanPham.getMaSP()).tenSP(sanPham.getTenSP()).giaHienTai(sanPham.getGiaHienTai()).isTopping(sanPham.getIsTopping()).trangThai(sanPham.getTrangThai()).build();
    sanPham.setTrangThai(0);
    SanPham saved = sanPhamRepository.save(sanPham);
    auditLogService.ghiLog(null, "SANPHAM", maSP, "DELETE_SOFT", oldValue, saved);
  }

  public List<SanPham> getByTrangThai(Integer trangThai) { return sanPhamRepository.findByTrangThai(trangThai); }
  public List<SanPham> getByIsTopping(Boolean isTopping) { return sanPhamRepository.findByIsTopping(isTopping); }
}