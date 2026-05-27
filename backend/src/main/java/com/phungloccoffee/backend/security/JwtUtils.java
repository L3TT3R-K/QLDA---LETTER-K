package com.phungloccoffee.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.SignatureAlgorithm;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    private static final String SECRET_KEY = "QLAD_JWT_SECRET_KEY_2026_SUPER_SECURE_PRIVATE_SYSTEM_KEY"; 
    private static final long EXPIRATION_TIME = 86400000; 
  
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String generateToken(String username, String chucVu, String maCN) {
            return Jwts.builder()
                    .setSubject(username) 
                    .claim("chucVu", chucVu) 
                    .claim("maCN", maCN) 
                    .setIssuedAt(new Date()) 
                    .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) 
                    .signWith(getSigningKey(), SignatureAlgorithm.HS256) 
                    .compact();
        }

    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true; 
        } catch (JwtException | IllegalArgumentException e) {
            return false; 
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

    public String getMaCNFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("maCN", String.class);
    }
}