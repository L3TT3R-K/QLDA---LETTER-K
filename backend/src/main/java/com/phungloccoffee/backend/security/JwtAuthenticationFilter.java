package com.phungloccoffee.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // 1. Lấy cái thẻ từ (Token) từ Header của luồng API gửi tới
        String header = request.getHeader("Authorization");

        // Token chuẩn luôn bắt đầu bằng chữ "Bearer "
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7); // Cắt bỏ chữ "Bearer " để lấy đúng mã code

            // 2. Đưa qua máy quét xem thẻ thật hay giả
            if (jwtUtils.validateToken(token)) {
                String username = jwtUtils.getUsernameFromToken(token);
                String chucVu = jwtUtils.getChucVuFromToken(token);

                // 3. Nếu thẻ chuẩn, cấp quyền đi tiếp vào Controller
                // Spring Security quy định Role phải có chữ "ROLE_" đứng trước
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + chucVu);
                
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        username, null, Collections.singletonList(authority));
                
                // Đóng dấu "Đã kiểm duyệt" cho luồng request này
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        
        // Đi tiếp đến chốt kiểm tra tiếp theo (hoặc vào thẳng Controller)
        filterChain.doFilter(request, response);
    }
}