package com.smartcampus.dto;

import com.smartcampus.domain.Ticket;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TicketRequest {
    private String resourceId;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private Ticket.TicketCategory category;

    @NotNull(message = "Priority is required")
    private Ticket.TicketPriority priority;

    private String location;

    private String contactName;

    @Pattern(regexp = "^[+]?[0-9\\s\\-]{7,15}$", message = "Invalid phone number")
    private String contactPhone;

    @Email(message = "Invalid contact email")
    private String contactEmail;
}
