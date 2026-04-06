package com.smartcampus.dto;

import com.smartcampus.domain.Booking;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
public class BookingResponse {
    private String id;
    private String resourceId;
    private String resourceName;
    private String resourceLocation;
    private String userId;
    private String userName;
    private String userEmail;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private Booking.BookingStatus status;
    private String adminNotes;
    private String reviewedById;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String qrCode;
}
