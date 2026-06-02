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
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) 
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/error").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() 
                
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/nhanvien", "/api/nhanvien/**")
                    .hasAnyRole("ADMIN", "QUANLY", "QUANLY_CHINHANH", "NHANVIEN_KHO", "KHO")
                .requestMatchers("/api/nhanvien", "/api/nhanvien/**").hasRole("ADMIN")
                .requestMatchers(
                    "/api/baocao/ton-kho",
                    "/api/baocao/canh-bao-ton-kho",
                    "/api/baocao/canh-bao",
                    "/api/baocao/giao-dich-dong-bo-loi",
                    "/api/baocao/hao-hut"
                ).hasAnyAuthority(
                    "ADMIN", "ROLE_ADMIN",
                    "QUANLY", "ROLE_QUANLY",
                    "QUANLY_CHINHANH", "ROLE_QUANLY_CHINHANH",
                    "NHANVIEN_KHO", "ROLE_NHANVIEN_KHO",
                    "KHO", "ROLE_KHO"
                )
                .requestMatchers("/api/baocao/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN", "QUANLY", "ROLE_QUANLY")                
              
                .requestMatchers("/api/kiemkho", "/api/kiemkho/**").authenticated()
                .requestMatchers("/api/tonkho", "/api/tonkho/**").authenticated()
                .requestMatchers("/api/nguyenlieu", "/api/nguyenlieu/**").authenticated()
                .requestMatchers("/api/congthuc", "/api/congthuc/**").authenticated()
                
                .requestMatchers("/api/inventory/**").hasAnyRole("ADMIN", "QUANLY", "QUANLY_CHINHANH", "NHANVIEN_KHO", "KHO")
                .requestMatchers("/api/nhapkho", "/api/nhapkho/**").hasAnyRole("ADMIN", "QUANLY", "QUANLY_CHINHANH", "NHANVIEN_KHO", "KHO")
                .requestMatchers("/api/xuatkho", "/api/xuatkho/**").hasAnyRole("ADMIN", "QUANLY", "QUANLY_CHINHANH", "NHANVIEN_KHO", "KHO")
                .requestMatchers("/api/dieuchuyenkho", "/api/dieuchuyenkho/**").hasAnyRole("ADMIN", "QUANLY", "QUANLY_CHINHANH", "NHANVIEN_KHO", "KHO")
                
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
        config.setAllowCredentials(true); 

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
