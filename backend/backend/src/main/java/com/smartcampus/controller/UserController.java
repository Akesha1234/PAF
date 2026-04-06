package com.smartcampus.controller;

import com.smartcampus.domain.User;
import com.smartcampus.dto.UserResponse;
import com.smartcampus.security.SecurityUtils;
import com.smartcampus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Module E – User / Auth management
 * Member 4 endpoints
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** GET /api/users/me - Get current authenticated user profile */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getUserById(SecurityUtils.getCurrentUserId()));
    }

    /** GET /api/users - List all users (ADMIN only) */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /** GET /api/users/{id} - Get user by ID (ADMIN only) */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getById(@PathVariable("id") String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /** PATCH /api/users/{id} - Update general user fields (ADMIN only) */
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> update(@PathVariable("id") String id,
            @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(userService.updateUser(id, payload));
    }

    /** DELETE /api/users/{id} - Permanent user removal (ADMIN only) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/auth/check - Simple endpoint to check if logged in */
    @GetMapping("/auth/check")
    public ResponseEntity<Map<String, Boolean>> authCheck() {
        try {
            SecurityUtils.getCurrentUser();
            return ResponseEntity.ok(Map.of("authenticated", true));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }
    }

    /** POST /api/users/register - Pre-register a testing account role before SSO */
    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String name = payload.get("name");
        String password = payload.get("password");
        User.Role role = User.Role.valueOf(payload.getOrDefault("role", "USER"));

        return ResponseEntity.ok(userService.registerInitialUser(email, name, role, password));
    }
}
