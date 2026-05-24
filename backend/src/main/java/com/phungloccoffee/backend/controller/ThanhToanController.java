package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.ApiResponse;
import com.phungloccoffee.backend.dto.ThanhToanRequest;
import com.phungloccoffee.backend.dto.ThanhToanResponse;
import com.phungloccoffee.backend.service.ThanhToanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/thanhtoan")
@RequiredArgsConstructor
public class ThanhToanController {

  private final ThanhToanService thanhToanService;

  @PostMapping
  public ResponseEntity<ApiResponse<ThanhToanResponse>> xacNhanThanhToan(@RequestBody ThanhToanRequest request) {
    ThanhToanResponse result = thanhToanService.thanhToan(request);
    ApiResponse<ThanhToanResponse> response = new ApiResponse<>();

    if (result.getMaTT() == null) {
      response.setStatus(400);
      response.setMessage(result.getMessage());
      return ResponseEntity.badRequest().body(response);
    }

    response.setStatus(200);
    response.setMessage("Giao dich thanh toan da duoc luu");
    response.setData(result);
    return ResponseEntity.ok(response);
  }
}
