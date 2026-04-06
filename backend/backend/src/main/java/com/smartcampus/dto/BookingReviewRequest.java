package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BookingReviewRequest {
    @NotBlank(message = "Decision is required: APPROVED or REJECTED")
    private String decision; // "APPROVED" or "REJECTED"

    private String adminNotes;
}
