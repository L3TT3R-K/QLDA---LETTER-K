package com.phungloccoffee.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
// import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Tắt bảo vệ CSRF (Vì chúng ta dùng API và Token nên không cần cái này của Web truyền thống)

            // Tắt Session (Vì Token đã chứa đủ thông tin rồi, Server không cần nhớ ai đang login)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // LUẬT PHÂN QUYỀN VÀO CÁC CỬA (API)
            .authorizeHttpRequests(auth -> auth
                // 1. Cửa Đăng nhập: Ai cũng được vào
                .requestMatchers("/api/auth/**").permitAll()
                
                // 2. Chỉ QUANLY mới được xem/ xóa/ sửa/ thêm danh sách nhân viên
                .requestMatchers("/api/nhanvien/**").hasRole("QUANLY")
                
                // 3. Tất cả các cửa còn lại: Phải có thẻ (đã đăng nhập) mới được vào
                .anyRequest().authenticated()
            );

        // Đặt bảo vệ JwtFilter đứng canh NGAY TRƯỚC cửa chính của hệ thống
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}