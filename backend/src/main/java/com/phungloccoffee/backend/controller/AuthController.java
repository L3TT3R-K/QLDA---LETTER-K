/*
Đây là nơi ghép nối mọi thứ lại với nhau: 
Nhận request -> Kiểm tra Database -> Đúng mật khẩu thì gọi máy in thẻ Token.
*/

package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.LoginRequest;
import com.phungloccoffee.backend.entity.NhanVien;
import com.phungloccoffee.backend.repository.NhanVienRepository;
import com.phungloccoffee.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // 1. Tìm nhân viên theo Username
        Optional<NhanVien> optionalNhanVien = nhanVienRepository.findByUserName(loginRequest.getUsername());

        if (optionalNhanVien.isPresent()) {
            NhanVien nhanVien = optionalNhanVien.get();

            // 2. Kiểm tra mật khẩu (Hiện tại test thô, sau này áp dụng BCrypt sẽ update lại dòng này)
            if (nhanVien.getPasswordHash().equals(loginRequest.getPassword())) {
                
                // 3. Đúng pass -> In thẻ Token
                String token = jwtUtils.generateToken(nhanVien.getUserName(), nhanVien.getChucVu());

                // 4. Trả về Token và thông tin cơ bản cho Frontend
                Map<String, String> response = new HashMap<>();
                response.put("token", token);
                response.put("chucVu", nhanVien.getChucVu());
                response.put("tenNV", nhanVien.getTenNV());
                
                return ResponseEntity.ok(response);
            }
        }
        
        // Cố tình báo chung chung để hacker không biết là sai user hay sai pass
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sai tên đăng nhập hoặc mật khẩu!");
    }
}