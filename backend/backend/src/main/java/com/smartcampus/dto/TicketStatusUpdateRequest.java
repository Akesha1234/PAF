package com.smartcampus.dto;

import com.smartcampus.domain.Ticket;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private Ticket.TicketStatus status;

    private String resolutionNotes;
    private String rejectionReason;
    private String assigneeId;
}
