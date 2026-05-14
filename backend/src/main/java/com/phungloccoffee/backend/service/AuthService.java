package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.AuthRequest;
import com.phungloccoffee.backend.entity.NhanVien;
import com.phungloccoffee.backend.repository.NhanVienRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final NhanVienRepository nhanVienRepository;
    private final PasswordEncoder passwordEncoder;

    public NhanVien authenticate(AuthRequest request) {
        NhanVien nv = nhanVienRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại!"));

        if (nv.getTrangThai() == null || nv.getTrangThai() == 0) {
            throw new RuntimeException("Tài khoản đã bị khóa hoặc nhân viên đã nghỉ việc!");
        }

        System.out.println("Pass tu Postman: " + request.getPassword());
        System.out.println("Pass trong DB: " + nv.getPasswordHash());
        System.out.println("MA HASH CHUAN CUA MAY CAU: " + passwordEncoder.encode("123456"));
        
        if (!passwordEncoder.matches(request.getPassword(), nv.getPasswordHash())) {
            throw new RuntimeException("Sai mật khẩu!");
        }

        return nv;
    }
}