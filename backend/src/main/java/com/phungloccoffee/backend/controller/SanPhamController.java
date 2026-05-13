package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.SanPhamRequest;
import com.phungloccoffee.backend.entity.SanPham;
import com.phungloccoffee.backend.service.SanPhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/san-pham")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SanPhamController {

  private final SanPhamService sanPhamService;

  @GetMapping
  public List<SanPham> getAll() {
    return sanPhamService.getAll();
  }

  @GetMapping("/{maSP}")
  public SanPham getById(@PathVariable String maSP) {
    return sanPhamService.getById(maSP);
  }

  @GetMapping("/trang-thai/{trangThai}")
  public List<SanPham> getByTrangThai(@PathVariable String trangThai) {
    return sanPhamService.getByTrangThai(trangThai);
  }

  @GetMapping("/topping/{isTopping}")
  public List<SanPham> getByIsTopping(@PathVariable Boolean isTopping) {
    return sanPhamService.getByIsTopping(isTopping);
  }

  @PostMapping
  public SanPham create(@RequestBody SanPhamRequest request) {
    return sanPhamService.create(request);
  }

  @PutMapping("/{maSP}")
  public SanPham update(
          @PathVariable String maSP,
          @RequestBody SanPhamRequest request
  ) {
    return sanPhamService.update(maSP, request);
  }

  @DeleteMapping("/{maSP}")
  public String delete(@PathVariable String maSP) {
    sanPhamService.delete(maSP);
    return "Đã ngưng bán sản phẩm: " + maSP;
  }
}
