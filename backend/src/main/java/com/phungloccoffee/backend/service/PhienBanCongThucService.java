package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.PhienBanCongThucRequest;
import com.phungloccoffee.backend.entity.PhienBanCongThuc;
import com.phungloccoffee.backend.repository.PhienBanCongThucRepository;
import com.phungloccoffee.backend.repository.SanPhamRepository;
import com.phungloccoffee.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PhienBanCongThucService {

  private static final Integer HOAT_DONG = 1;
  private static final Integer NGUNG_HOAT_DONG = 0;

  private final PhienBanCongThucRepository phienBanCongThucRepository;
  private final SanPhamRepository sanPhamRepository;

  private void requireAdminAccess() {
      if (!SecurityUtils.canAccessAllBranches()) {
          throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ Admin mới có quyền thao tác dữ liệu công thức pha chế");
      }
  }

  public List<PhienBanCongThuc> getAll() {
    return phienBanCongThucRepository.findAll();
  }

  public PhienBanCongThuc getById(String maPB) {
    return phienBanCongThucRepository.findById(maPB)
        .orElseThrow(() -> new RuntimeException("Khong tim thay phien ban cong thuc: " + maPB));
  }

  public List<PhienBanCongThuc> getByMaSP(String maSP) {
    return phienBanCongThucRepository.findByMaSP(maSP);
  }

  public PhienBanCongThuc getActiveByMaSP(String maSP) {
    return phienBanCongThucRepository.findByMaSPAndTrangThai(maSP, HOAT_DONG)
        .orElseThrow(() -> new RuntimeException("San pham chua co cong thuc dang ap dung: " + maSP));
  }

  @Transactional
  public PhienBanCongThuc create(PhienBanCongThucRequest request) {
    requireAdminAccess(); 

    if (request.getMaPB() == null || request.getMaPB().isBlank()) {
      throw new RuntimeException("Ma phien ban khong duoc de trong");
    }

    if (phienBanCongThucRepository.existsById(request.getMaPB())) {
      throw new RuntimeException("Ma phien ban da ton tai: " + request.getMaPB());
    }

    validateSanPham(request.getMaSP());

    Integer trangThai = request.getTrangThai() == null ? HOAT_DONG : request.getTrangThai();
    if (HOAT_DONG.equals(trangThai)) {
      deactivateOldActiveVersions(request.getMaSP());
    }

    PhienBanCongThuc phienBan = PhienBanCongThuc.builder()
        .maPB(request.getMaPB())
        .maSP(request.getMaSP())
        .ngayHieuLuc(request.getNgayHieuLuc() == null ? LocalDateTime.now() : request.getNgayHieuLuc())
        .trangThai(trangThai)
        .build();

    return phienBanCongThucRepository.save(phienBan);
  }

  @Transactional
  public PhienBanCongThuc update(String maPB, PhienBanCongThucRequest request) {
    requireAdminAccess(); 

    PhienBanCongThuc phienBan = getById(maPB);
    validateSanPham(request.getMaSP());

    Integer trangThai = request.getTrangThai() == null ? phienBan.getTrangThai() : request.getTrangThai();
    if (HOAT_DONG.equals(trangThai)) {
      deactivateOldActiveVersions(request.getMaSP());
    }

    phienBan.setMaSP(request.getMaSP());
    phienBan.setNgayHieuLuc(request.getNgayHieuLuc() == null ? phienBan.getNgayHieuLuc() : request.getNgayHieuLuc());
    phienBan.setTrangThai(trangThai);

    return phienBanCongThucRepository.save(phienBan);
  }

  public void delete(String maPB) {
    requireAdminAccess(); 

    PhienBanCongThuc phienBan = getById(maPB);
    phienBan.setTrangThai(NGUNG_HOAT_DONG);
    phienBanCongThucRepository.save(phienBan);
  }

  private void validateSanPham(String maSP) {
    if (maSP == null || maSP.isBlank()) {
      throw new RuntimeException("Ma san pham khong duoc de trong");
    }
    if (!sanPhamRepository.existsById(maSP)) {
      throw new RuntimeException("San pham khong ton tai: " + maSP);
    }
  }

  private void deactivateOldActiveVersions(String maSP) {
    List<PhienBanCongThuc> activeVersions =
        phienBanCongThucRepository.findAllByMaSPAndTrangThai(maSP, HOAT_DONG);

    for (PhienBanCongThuc item : activeVersions) {
      item.setTrangThai(NGUNG_HOAT_DONG);
    }

    phienBanCongThucRepository.saveAll(activeVersions);
  }
}