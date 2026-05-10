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
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/error").permitAll()
                
                .requestMatchers("/api/nhanvien/**").hasRole("QUANLY")
                .requestMatchers("/api/kiemkho", "/api/kiemkho/**").hasAnyRole("QUANLY", "KHO")
                .requestMatchers("/api/baocao/**").hasRole("QUANLY")
                
                .anyRequest().authenticated()
            );

        // Đặt bảo vệ JwtFilter đứng canh NGAY TRƯỚC cửa chính của hệ thống
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}