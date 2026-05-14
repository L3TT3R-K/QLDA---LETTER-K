// package com.phungloccoffee.backend.controller;

// import com.phungloccoffee.backend.dto.PhienBanCongThucRequest;
// import com.phungloccoffee.backend.entity.PhienBanCongThuc;
// import com.phungloccoffee.backend.service.PhienBanCongThucService;
// import lombok.RequiredArgsConstructor;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;

// @RestController
// @RequestMapping("/api/phien-ban-cong-thuc")
// @RequiredArgsConstructor
// @CrossOrigin(origins = "*")
// public class PhienBanCongThucController {

//   private final PhienBanCongThucService phienBanCongThucService;

//   @GetMapping
//   public List<PhienBanCongThuc> getAll() {
//     return phienBanCongThucService.getAll();
//   }

//   @GetMapping("/{maPB}")
//   public PhienBanCongThuc getById(@PathVariable String maPB) {
//     return phienBanCongThucService.getById(maPB);
//   }

//   @GetMapping("/san-pham/{maSP}")
//   public List<PhienBanCongThuc> getByMaSP(@PathVariable String maSP) {
//     return phienBanCongThucService.getByMaSP(maSP);
//   }

//   @GetMapping("/san-pham/{maSP}/active")
//   public PhienBanCongThuc getActiveByMaSP(@PathVariable String maSP) {
//     return phienBanCongThucService.getActiveByMaSP(maSP);
//   }

//   @PostMapping
//   public PhienBanCongThuc create(@RequestBody PhienBanCongThucRequest request) {
//     return phienBanCongThucService.create(request);
//   }

//   @PutMapping("/{maPB}")
//   public PhienBanCongThuc update(
//           @PathVariable String maPB,
//           @RequestBody PhienBanCongThucRequest request
//   ) {
//     return phienBanCongThucService.update(maPB, request);
//   }

//   @DeleteMapping("/{maPB}")
//   public String delete(@PathVariable String maPB) {
//     phienBanCongThucService.delete(maPB);
//     return "Đã ngưng áp dụng phiên bản công thức: " + maPB;
//   }
// }
