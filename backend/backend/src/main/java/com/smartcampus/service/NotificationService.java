package com.smartcampus.service;

import com.smartcampus.domain.Notification;
import com.smartcampus.domain.User;
import com.smartcampus.dto.NotificationResponse;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createNotification(String userId, String title, String message,
            Notification.NotificationType type,
            String referenceId, Notification.ReferenceType referenceType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .read(false)
                .build();

        notificationRepository.save(notification);
    }

    @Transactional
    public void notifyAdmins(String title, String message, Notification.NotificationType type, String refId, Notification.ReferenceType refType) {
        userRepository.findAll().stream()
            .filter(u -> u.getRole() == User.Role.ADMIN)
            .forEach(admin -> createNotification(admin.getId(), title, message, type, refId, refType));
    }

    @Transactional
    public void notifyTechnicians(String title, String message, Notification.NotificationType type, String refId, Notification.ReferenceType refType) {
        userRepository.findAll().stream()
            .filter(u -> u.getRole() == User.Role.TECHNICIAN)
            .forEach(tech -> createNotification(tech.getId(), title, message, type, refId, refType));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsForUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndRead(userId, false);
    }

    @Transactional
    public NotificationResponse markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        if (!notification.getUser().getId().equals(userId)) {
            throw new com.smartcampus.exception.AccessDeniedException("Not your notification");
        }
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public int markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndRead(userId, false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        return unread.size();
    }

    private NotificationResponse toResponse(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.setId(n.getId());
        r.setTitle(n.getTitle());
        r.setMessage(n.getMessage());
        r.setType(n.getType());
        r.setReferenceId(n.getReferenceId());
        r.setReferenceType(n.getReferenceType());
        r.setRead(n.isRead());
        r.setCreatedAt(n.getCreatedAt());
        return r;
    }
}
