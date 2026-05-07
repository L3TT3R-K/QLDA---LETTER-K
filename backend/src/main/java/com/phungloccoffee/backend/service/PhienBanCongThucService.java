package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.PhienBanCongThucRequest;
import com.phungloccoffee.backend.entity.PhienBanCongThuc;
import com.phungloccoffee.backend.repository.PhienBanCongThucRepository;
import com.phungloccoffee.backend.repository.SanPhamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PhienBanCongThucService {

  private final PhienBanCongThucRepository phienBanCongThucRepository;
  private final SanPhamRepository sanPhamRepository;

  public List<PhienBanCongThuc> getAll() {
    return phienBanCongThucRepository.findAll();
  }

  public PhienBanCongThuc getById(String maPB) {
    return phienBanCongThucRepository.findById(maPB)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên bản công thức: " + maPB));
  }

  public List<PhienBanCongThuc> getByMaSP(String maSP) {
    return phienBanCongThucRepository.findByMaSP(maSP);
  }

  public PhienBanCongThuc getActiveByMaSP(String maSP) {
    return phienBanCongThucRepository.findByMaSPAndTrangThai(maSP, 1)
            .orElseThrow(() -> new RuntimeException("Sản phẩm chưa có công thức đang áp dụng: " + maSP));
  }

  @Transactional
  public PhienBanCongThuc create(PhienBanCongThucRequest request) {
    if (request.getMaPB() == null || request.getMaPB().isBlank()) {
      throw new RuntimeException("Mã phiên bản không được để trống");
    }

    if (phienBanCongThucRepository.existsById(request.getMaPB())) {
      throw new RuntimeException("Mã phiên bản đã tồn tại: " + request.getMaPB());
    }

    if (!sanPhamRepository.existsById(request.getMaSP())) {
      throw new RuntimeException("Sản phẩm không tồn tại: " + request.getMaSP());
    }

    Integer trangThai = request.getTrangThai() == null ? 1 : request.getTrangThai();

    // Quy tắc: mỗi sản phẩm chỉ có 1 phiên bản công thức active
    if (trangThai == 1) {
      deactivateOldActiveVersions(request.getMaSP());
    }

    PhienBanCongThuc phienBan = PhienBanCongThuc.builder()
            .maPB(request.getMaPB())
            .maSP(request.getMaSP())
            .ngayHieuLuc(request.getNgayHieuLuc())
            .trangThai(trangThai)
            .build();

    return phienBanCongThucRepository.save(phienBan);
  }

  @Transactional
  public PhienBanCongThuc update(String maPB, PhienBanCongThucRequest request) {
    PhienBanCongThuc phienBan = getById(maPB);

    if (!sanPhamRepository.existsById(request.getMaSP())) {
      throw new RuntimeException("Sản phẩm không tồn tại: " + request.getMaSP());
    }

    Integer trangThai = request.getTrangThai() == null ? phienBan.getTrangThai() : request.getTrangThai();

    if (trangThai == 1) {
      deactivateOldActiveVersions(request.getMaSP());
    }

    phienBan.setMaSP(request.getMaSP());
    phienBan.setNgayHieuLuc(request.getNgayHieuLuc());
    phienBan.setTrangThai(trangThai);

    return phienBanCongThucRepository.save(phienBan);
  }

  public void delete(String maPB) {
    PhienBanCongThuc phienBan = getById(maPB);

    // Xóa mềm phiên bản công thức
    phienBan.setTrangThai(0);

    phienBanCongThucRepository.save(phienBan);
  }

  private void deactivateOldActiveVersions(String maSP) {
    List<PhienBanCongThuc> activeVersions =
            phienBanCongThucRepository.findAllByMaSPAndTrangThai(maSP, 1);

    for (PhienBanCongThuc item : activeVersions) {
      item.setTrangThai(0);
    }

    phienBanCongThucRepository.saveAll(activeVersions);
  }
}
