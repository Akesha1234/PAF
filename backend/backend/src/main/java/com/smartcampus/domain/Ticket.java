package com.smartcampus.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id")
    private Resource resource;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    private String location;

    private String contactName;
    private String contactPhone;
    private String contactEmail;

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    // Stores up to 3 image attachment paths (semicolon-separated)
    @Column(columnDefinition = "TEXT")
    private String attachmentPaths;

    private LocalDateTime resolvedAt;
    private LocalDateTime firstResponseAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    public enum TicketCategory {
        ELECTRICAL, PLUMBING, IT_INFRASTRUCTURE, HVAC, STRUCTURAL, CLEANING, SECURITY, OTHER
    }

    public enum TicketPriority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum TicketStatus {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    }
}
