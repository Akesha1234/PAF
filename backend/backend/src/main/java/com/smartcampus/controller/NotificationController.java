package com.smartcampus.controller;

import com.smartcampus.dto.NotificationResponse;
import com.smartcampus.security.SecurityUtils;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Module D – Notifications
 * Member 4 endpoints
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /** GET /api/notifications - Get all notifications for current user */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> getAll() {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(SecurityUtils.getCurrentUserId()));
    }

    /** GET /api/notifications/unread-count - Get unread notification count */
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        long count = notificationService.getUnreadCount(SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    /** PATCH /api/notifications/{id}/read - Mark one notification as read */
    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationResponse> markRead(@PathVariable("id") String id) {
        return ResponseEntity.ok(notificationService.markAsRead(id, SecurityUtils.getCurrentUserId()));
    }

    /** PATCH /api/notifications/read-all - Mark all as read */
    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Integer>> markAllRead() {
        int count = notificationService.markAllAsRead(SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(Map.of("marked", count));
    }
}
