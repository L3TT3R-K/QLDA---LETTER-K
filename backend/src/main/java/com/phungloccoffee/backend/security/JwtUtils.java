/*
Tạo token khi user đăng nhập thành công
Đọc thông tin từ token
Kiểm tra token có hợp lệ hay không
*/

package com.phungloccoffee.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    // CHÚ Ý: Khóa bí mật này giống như con dấu của công ty. Tuyệt đối không để lộ!
    // Yêu cầu của JWT là khóa này phải dài ít nhất 32 ký tự (256-bit).
    private static final String SECRET_KEY = "QLAD_JWT_SECRET_KEY_2026_SUPER_SECURE_PRIVATE_SYSTEM_KEY"; 
    
    
    private static final long EXPIRATION_TIME = 86400000; 
    /*
    Sau 24h:
    token hết hạn
    user phải login lại 
    */

    
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }
    /*
    Hàm này:
    biến chuỗi SECRET_KEY
    thành object Key
    */

    //Tạo ra Token khi Đăng nhập thành công
    public String generateToken(String username, String chucVu) {
        return Jwts.builder()
                .setSubject(username) // Tên người dùng (Ở dự án này là Username hoặc MaNV)
                .claim("chucVu", chucVu) // nhúng thẳng chức vụ vào trong Token. Sau này khi có ai đó gọi API Báo cáo, hệ thống chỉ việc "mổ" Token này ra, thấy chữ QUANLY thì cho qua, thấy THUNGAN thì chặn lại luôn mà không cần phải chọc xuống Database để tìm nữa!
                .setIssuedAt(new Date()) // Thời gian phát hành
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // Thời gian hết hạn
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Đóng dấu đỏ!
                .compact();
    }

    // Lấy Username từ Token gửi lên
    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // Kiểm tra xem Token có hợp lệ / có bị làm giả hay hết hạn không
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true; // Thẻ thật, cho qua
        } catch (JwtException | IllegalArgumentException e) {
            return false; // Thẻ giả hoặc hết hạn, đuổi ra
        }
    }

    public String getChucVuFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("chucVu", String.class);
    }
}