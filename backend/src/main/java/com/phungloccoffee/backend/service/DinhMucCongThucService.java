package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.DinhMucCongThucRequest;
import com.phungloccoffee.backend.entity.DinhMucCongThuc;
import com.phungloccoffee.backend.entity.DinhMucCongThucId;
import com.phungloccoffee.backend.repository.DinhMucCongThucRepository;
import com.phungloccoffee.backend.repository.PhienBanCongThucRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DinhMucCongThucService {

  private final DinhMucCongThucRepository dinhMucCongThucRepository;
  private final PhienBanCongThucRepository phienBanCongThucRepository;

  public List<DinhMucCongThuc> getAll() {
    return dinhMucCongThucRepository.findAll();
  }

  public List<DinhMucCongThuc> getByMaPB(String maPB) {
    return dinhMucCongThucRepository.findByIdMaPB(maPB);
  }

  public DinhMucCongThuc getById(String maPB, String maNL) {
    DinhMucCongThucId id = new DinhMucCongThucId(maPB, maNL);

    return dinhMucCongThucRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy định mức công thức"));
  }

  public DinhMucCongThuc create(DinhMucCongThucRequest request) {
    if (!phienBanCongThucRepository.existsById(request.getMaPB())) {
      throw new RuntimeException("Phiên bản công thức không tồn tại: " + request.getMaPB());
    }

    if (request.getSoLuong() == null || request.getSoLuong().compareTo(BigDecimal.ZERO) <= 0) {
      throw new RuntimeException("Số lượng nguyên liệu phải lớn hơn 0");
    }

    DinhMucCongThucId id = new DinhMucCongThucId(request.getMaPB(), request.getMaNL());

    if (dinhMucCongThucRepository.existsById(id)) {
      throw new RuntimeException("Nguyên liệu này đã tồn tại trong công thức");
    }

    DinhMucCongThuc dinhMuc = DinhMucCongThuc.builder()
            .id(id)
            .soLuong(request.getSoLuong())
            .build();

    return dinhMucCongThucRepository.save(dinhMuc);
  }

  public DinhMucCongThuc update(String maPB, String maNL, DinhMucCongThucRequest request) {
    DinhMucCongThuc dinhMuc = getById(maPB, maNL);

    if (request.getSoLuong() == null || request.getSoLuong().compareTo(BigDecimal.ZERO) <= 0) {
      throw new RuntimeException("Số lượng nguyên liệu phải lớn hơn 0");
    }

    dinhMuc.setSoLuong(request.getSoLuong());

    return dinhMucCongThucRepository.save(dinhMuc);
  }

  public void delete(String maPB, String maNL) {
    DinhMucCongThucId id = new DinhMucCongThucId(maPB, maNL);

    if (!dinhMucCongThucRepository.existsById(id)) {
      throw new RuntimeException("Không tìm thấy định mức công thức");
    }

    dinhMucCongThucRepository.deleteById(id);
  }
}
