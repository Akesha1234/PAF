package com.smartcampus.controller;

import com.smartcampus.domain.Booking;
import com.smartcampus.dto.BookingRequest;
import com.smartcampus.dto.BookingResponse;
import com.smartcampus.dto.BookingReviewRequest;
import com.smartcampus.security.SecurityUtils;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Module B – Booking Management
 * Member 2 endpoints
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /** POST /api/bookings - Create a booking request */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(request, SecurityUtils.getCurrentUserId()));
    }

    /** GET /api/bookings - Admin sees all; user sees own */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponse>> getAll(
            @RequestParam(name = "status", required = false) Booking.BookingStatus status) {
        if (SecurityUtils.isAdmin()) {
            return ResponseEntity.ok(bookingService.getAllBookings(status));
        }
        return ResponseEntity.ok(bookingService.getUserBookings(SecurityUtils.getCurrentUserId(), status));
    }

    /** GET /api/bookings/my - Current user's bookings */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @RequestParam(name = "status", required = false) Booking.BookingStatus status) {
        return ResponseEntity.ok(bookingService.getUserBookings(SecurityUtils.getCurrentUserId(), status));
    }

    /** GET /api/bookings/{id} - Get booking by ID */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> getById(@PathVariable("id") String id) {
        return ResponseEntity.ok(bookingService.getById(id));
    }

    /** PATCH /api/bookings/{id}/review - Admin approves or rejects */
    @PatchMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> review(@PathVariable("id") String id,
            @Valid @RequestBody BookingReviewRequest request) {
        return ResponseEntity.ok(bookingService.reviewBooking(id, request, SecurityUtils.getCurrentUserId()));
    }

    /** PATCH /api/bookings/{id}/cancel - User cancels their own booking */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> cancel(@PathVariable("id") String id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, SecurityUtils.getCurrentUserId()));
    }

    /** POST /api/bookings/{id}/checkin - Admin scans QR code payload and checks in the booking */
    @PostMapping("/{id}/checkin")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<BookingResponse> checkin(@PathVariable("id") String id) {
        return ResponseEntity.ok(bookingService.checkIn(id));
    }

    /** PUT /api/bookings/{id} - Update a booking record */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> update(@PathVariable("id") String id, @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.updateBooking(id, request, SecurityUtils.getCurrentUserId()));
    }

    /** DELETE /api/bookings/{id} - Admin can delete any booking */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
