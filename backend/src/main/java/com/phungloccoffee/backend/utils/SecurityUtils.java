package com.phungloccoffee.backend.utils;

import com.phungloccoffee.backend.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

public class SecurityUtils {

    public static String getCurrentUserBranch() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            return principal.getMaCN();
        }
        return null;
    }

    public static String requireCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            if (principal.getUsername() != null && !principal.getUsername().isBlank()) {
                return principal.getUsername();
            }
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Khong xac dinh duoc nguoi dung dang nhap");
    }

    public static String requireCurrentUserBranch() {
        String maCN = getCurrentUserBranch();
        if (maCN == null || maCN.isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Khong xac dinh duoc chi nhanh cua nguoi dung");
        }
        return maCN;
    }

    public static void requireSameBranch(String maCN) {
        maCN = normalizeBranch(maCN);
        String currentMaCN = requireCurrentUserBranch();
        if (maCN != null && !maCN.isBlank() && !currentMaCN.equals(maCN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Khong duoc truy cap du lieu ton kho cua chi nhanh khac");
        }
    }

    public static boolean hasAnyAuthority(String... authorityNames) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }

        for (String authorityName : authorityNames) {
            boolean matched = authentication.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthority().equals(authorityName));
            if (matched) {
                return true;
            }
        }

        return false;
    }

    public static boolean canAccessAllBranches() {
        return hasAnyAuthority("ADMIN", "ROLE_ADMIN", "QUANLY", "ROLE_QUANLY");
    }

    public static String resolveInventoryBranch(String maCN) {
        String normalizedMaCN = normalizeBranch(maCN);
        if (canAccessAllBranches()) {
            return normalizedMaCN;
        }

        requireSameBranch(normalizedMaCN);
        return requireCurrentUserBranch();
    }

    public static void requireInventoryBranchAccess(String maCN) {
        if (canAccessAllBranches()) {
            return;
        }

        requireSameBranch(maCN);
    }

    public static String normalizeBranch(String maCN) {
        if (maCN == null) {
            return null;
        }
        String normalized = maCN.trim();
        if (normalized.isEmpty()
                || "null".equalsIgnoreCase(normalized)
                || "undefined".equalsIgnoreCase(normalized)
                || "all".equalsIgnoreCase(normalized)) {
            return null;
        }
        return normalized;
    }
}
