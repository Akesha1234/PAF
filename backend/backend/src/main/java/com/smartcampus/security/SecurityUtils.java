package com.smartcampus.security;

import com.smartcampus.domain.User;
import com.smartcampus.exception.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public class SecurityUtils {

    public static User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof User)) {
            throw new AccessDeniedException("Not authenticated");
        }
        return (User) auth.getPrincipal();
    }

    public static String getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public static boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null)
            return false;
        return auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    public static boolean isTechnician() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null)
            return false;
        return auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_TECHNICIAN"));
    }

    public static boolean isAdminOrTechnician() {
        return isAdmin() || isTechnician();
    }
}
