package com.smartcampus.dto;

import com.smartcampus.domain.Ticket;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TicketResponse {
    private String id;
    private String resourceId;
    private String resourceName;
    private String reporterId;
    private String reporterName;
    private String reporterEmail;
    private String assigneeId;
    private String assigneeName;
    private String title;
    private String description;
    private Ticket.TicketCategory category;
    private Ticket.TicketPriority priority;
    private Ticket.TicketStatus status;
    private String location;
    private String contactName;
    private String contactPhone;
    private String contactEmail;
    private String resolutionNotes;
    private String rejectionReason;
    private List<String> attachmentUrls;
    private LocalDateTime resolvedAt;
    private LocalDateTime firstResponseAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long commentsCount;
}
