package com.smartcampus.dto;

import com.smartcampus.domain.Notification;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private String id;
    private String title;
    private String message;
    private Notification.NotificationType type;
    private String referenceId;
    private Notification.ReferenceType referenceType;
    private boolean read;
    private LocalDateTime createdAt;
}
