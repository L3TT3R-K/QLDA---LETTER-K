package com.phungloccoffee.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. THÊM DÒNG NÀY: Để kích hoạt cấu hình CORS bên dưới
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) 
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/api/auth/**", "/error").permitAll()
                // Giữ nguyên các luật cũ của Khoa
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                .requestMatchers("/api/nhanvien", "/api/nhanvien/**").hasAnyRole("ADMIN", "QUANLY")
                .requestMatchers("/api/baocao/**").hasAnyRole("ADMIN", "QUANLY", "NHANVIEN_KHO", "KHO")
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Thêm quyền cho API tồn kho mới của chúng ta
                .requestMatchers("/api/inventory/**").hasAnyRole("ADMIN", "QUANLY", "NHANVIEN_KHO", "KHO")
                .requestMatchers("/api/kiemkho", "/api/kiemkho/**").hasAnyRole("ADMIN", "QUANLY", "NHANVIEN_KHO", "KHO")
                .requestMatchers("/api/dieuchuyenkho", "/api/dieuchuyenkho/**").hasAnyRole("ADMIN", "QUANLY", "NHANVIEN_KHO", "KHO")
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000")); 
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        // Cho phép gửi kèm thông tin xác thực (nếu sau này dùng Cookie)
        config.setAllowCredentials(true); 

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
