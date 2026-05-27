package com.phungloccoffee.backend.security;

import com.phungloccoffee.backend.entity.NhanVien;
import com.phungloccoffee.backend.repository.NhanVienRepository;
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
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            if (jwtUtils.validateToken(token)) {
                String username = jwtUtils.getUsernameFromToken(token);
                String chucVu = jwtUtils.getChucVuFromToken(token);
                String maCN = jwtUtils.getMaCNFromToken(token);

                if (isBlank(maCN)) {
                    maCN = nhanVienRepository.findByUsername(username)
                            .map(NhanVien::getMaCN)
                            .orElse(null);
                }

                String roleName = normalizeRole(chucVu);
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority(roleName));
                authorities.add(new SimpleGrantedAuthority(roleName.replaceFirst("^ROLE_", "")));
                
                UserPrincipal principal = new UserPrincipal(username, "", maCN, authorities);
                
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        principal, null, authorities);
                
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        
        filterChain.doFilter(request, response);
    }

    private String normalizeRole(String chucVu) {
        if (chucVu == null || chucVu.isBlank()) {
            return "ROLE_USER";
        }
        String normalized = chucVu.trim();
        return normalized.startsWith("ROLE_") ? normalized : "ROLE_" + normalized;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
