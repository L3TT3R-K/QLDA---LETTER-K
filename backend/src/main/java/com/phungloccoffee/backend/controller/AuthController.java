package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.AuthRequest;
import com.phungloccoffee.backend.entity.NhanVien;
import com.phungloccoffee.backend.service.AuthService;
import com.phungloccoffee.backend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final JwtUtils jwtUtils; 

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            // 1. Kiểm tra username & password (đã qua mã hóa BCrypt)
            NhanVien nv = authService.authenticate(request);

            // 2. Sinh Token JWT xịn từ JwtUtils
            // 🌟 ĐÃ SỬA: Bơm thêm nv.getMaCN() vào Token để thực hiện cách ly dữ liệu
            String token = jwtUtils.generateToken(nv.getUsername(), nv.getChucVu(), nv.getMaCN());

            // 3. Đóng gói dữ liệu trả về cho Frontend
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("maNV", nv.getMaNV());
            response.put("tenNV", nv.getTenNV());
            response.put("chucVu", nv.getChucVu());
            response.put("maCN", nv.getMaCN());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}