package com.phungloccoffee.backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordCheck {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String rawPassword = "123456";

        String hash = "$2a$10$QG.9XTiVePNgbBGdan2/IeXFUnObAP24c7rbS5/pLa87umZ7vB3de";

        boolean matches = encoder.matches(rawPassword, hash);

        System.out.println("Password đúng không: " + matches);
    }
}