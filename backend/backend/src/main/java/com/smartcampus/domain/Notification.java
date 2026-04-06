package com.smartcampus.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    /** Reference to the related booking or ticket ID */
    private String referenceId;

    @Enumerated(EnumType.STRING)
    private ReferenceType referenceType;

    @Column(nullable = false)
    @Builder.Default
    private boolean read = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum NotificationType {
        BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_CANCELLED,
        TICKET_STATUS_CHANGED, TICKET_ASSIGNED, TICKET_COMMENT_ADDED,
        GENERAL
    }

    public enum ReferenceType {
        BOOKING, TICKET
    }
}
