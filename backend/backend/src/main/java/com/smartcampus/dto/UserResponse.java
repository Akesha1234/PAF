package com.smartcampus.dto;

import com.smartcampus.domain.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponse {
    private String id;
    private String email;
    private String name;
    private String pictureUrl;
    private User.Role role;
    private LocalDateTime createdAt;
}
