package com.smartcampus.service;

import com.smartcampus.domain.User;
import com.smartcampus.dto.UserResponse;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class UserService {
    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    /**
     * Called by OAuth2 success handler to upsert user from Google token.
     */
    @Transactional
    public User processOAuthUser(OAuth2User oAuth2User) {
        Map<String, Object> attrs = oAuth2User.getAttributes();
        String email = (String) attrs.get("email");
        String name = (String) attrs.get("name");
        String picture = (String) attrs.get("picture");
        String sub = (String) attrs.get("sub"); // Google ID

        return userRepository.findByEmail(email)
                .map(user -> {
                    user.setName(name);
                    user.setPictureUrl(picture);
                    user.setGoogleId(sub);
                    return userRepository.save(user);
                })
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email(email)
                                .name(name)
                                .pictureUrl(picture)
                                .googleId(sub)
                                .role(User.Role.USER)
                                .build()));
    }

    @Transactional
    public UserResponse registerInitialUser(String email, String name, User.Role role, String plainPassword) {
        User user = userRepository.findByEmail(email).orElse(new User());
        user.setEmail(email);
        user.setName(name);
        if (plainPassword != null && !plainPassword.isBlank()) {
            user.setPassword(passwordEncoder.encode(plainPassword));
        }

        if (user.getRole() == null) {
            user.setRole(role);
        } else {
            // Overwrite role if they explicitly registered via this special endpoint
            user.setRole(role);
        }
        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserResponse login(String email, String plainPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.smartcampus.exception.BusinessException("Invalid credentials"));

        if (user.getPassword() == null || !passwordEncoder.matches(plainPassword, user.getPassword())) {
            throw new com.smartcampus.exception.BusinessException("Invalid credentials");
        }

        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(String id) {
        return toResponse(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id)));
    }

    @Transactional
    public UserResponse updateRole(String userId, User.Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setRole(role);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        
        // Safety check: Cannot delete self
        try {
            if (user.getId().equals(com.smartcampus.security.SecurityUtils.getCurrentUserId())) {
                throw new com.smartcampus.exception.BusinessException("Self-deletion is restricted for security reasons.");
            }
        } catch (Exception e) {}

        // Nullify technician assignments
        if (user.getAssignedTickets() != null) {
            user.getAssignedTickets().forEach(t -> t.setAssignee(null));
        }

        userRepository.delete(user);
    }

    @Transactional
    public UserResponse updateUser(String id, Map<String, String> payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        
        if (payload.containsKey("name")) user.setName(payload.get("name"));
        if (payload.containsKey("role")) user.setRole(User.Role.valueOf(payload.get("role")));
        if (payload.containsKey("email")) user.setEmail(payload.get("email"));
        
        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        return toResponse(userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User with email", email)));
    }

    public UserResponse toResponse(User u) {
        UserResponse r = new UserResponse();
        r.setId(u.getId());
        r.setEmail(u.getEmail());
        r.setName(u.getName());
        r.setPictureUrl(u.getPictureUrl());
        r.setRole(u.getRole());
        r.setCreatedAt(u.getCreatedAt());
        return r;
    }
}
