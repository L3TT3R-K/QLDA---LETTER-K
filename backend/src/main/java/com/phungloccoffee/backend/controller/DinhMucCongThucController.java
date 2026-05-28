package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.DinhMucCongThucRequest;
import com.phungloccoffee.backend.entity.DinhMucCongThuc;
import com.phungloccoffee.backend.service.DinhMucCongThucService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dinh-muc-cong-thuc")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DinhMucCongThucController {

  private final DinhMucCongThucService dinhMucCongThucService;

  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN', 'QUANLY', 'QUANLY_CHINHANH', 'NHANVIEN_BANHANG')")
  public List<DinhMucCongThuc> getAll() {
    return dinhMucCongThucService.getAll();
  }

  @GetMapping("/phien-ban/{maPB}")
  @PreAuthorize("hasAnyRole('ADMIN', 'QUANLY', 'QUANLY_CHINHANH', 'NHANVIEN_BANHANG')")
  public List<DinhMucCongThuc> getByMaPB(@PathVariable String maPB) {
    return dinhMucCongThucService.getByMaPB(maPB);
  }

  @GetMapping("/{maPB}/{maNL}")
  @PreAuthorize("hasAnyRole('ADMIN', 'QUANLY', 'QUANLY_CHINHANH', 'NHANVIEN_BANHANG')")
  public DinhMucCongThuc getById(
          @PathVariable String maPB,
          @PathVariable String maNL
  ) {
    return dinhMucCongThucService.getById(maPB, maNL);
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public DinhMucCongThuc create(@RequestBody DinhMucCongThucRequest request) {
    return dinhMucCongThucService.create(request);
  }

  @PutMapping("/{maPB}/{maNL}")
  @PreAuthorize("hasRole('ADMIN')")
  public DinhMucCongThuc update(
          @PathVariable String maPB,
          @PathVariable String maNL,
          @RequestBody DinhMucCongThucRequest request
  ) {
    return dinhMucCongThucService.update(maPB, maNL, request);
  }

  @DeleteMapping("/{maPB}/{maNL}")
  @PreAuthorize("hasRole('ADMIN')")
  public String delete(
          @PathVariable String maPB,
          @PathVariable String maNL
  ) {
    dinhMucCongThucService.delete(maPB, maNL);
    return "Đã xóa nguyên liệu khỏi công thức";
  }
}
