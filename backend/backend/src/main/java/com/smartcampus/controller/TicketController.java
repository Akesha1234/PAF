package com.smartcampus.controller;

import com.smartcampus.domain.Ticket;
import com.smartcampus.dto.*;
import com.smartcampus.security.SecurityUtils;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Module C – Maintenance & Incident Ticketing
 * Member 3 endpoints
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    /** POST /api/tickets - Create a ticket with optional image attachments */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketResponse> create(
            @Valid @RequestPart("ticket") TicketRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(request, files, SecurityUtils.getCurrentUserId()));
    }

    /** POST /api/tickets (JSON) - Create ticket without attachments */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketResponse> createJson(@Valid @RequestBody TicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(request, null, SecurityUtils.getCurrentUserId()));
    }

    /** GET /api/tickets - Admin/Technician sees all; user sees own */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TicketResponse>> getAll(
            @RequestParam(name = "status", required = false) Ticket.TicketStatus status,
            @RequestParam(name = "priority", required = false) Ticket.TicketPriority priority,
            @RequestParam(name = "category", required = false) Ticket.TicketCategory category) {
        if (SecurityUtils.isAdminOrTechnician()) {
            return ResponseEntity.ok(ticketService.getAllTickets(status, priority, category));
        }
        return ResponseEntity.ok(ticketService.getMyTickets(SecurityUtils.getCurrentUserId()));
    }

    /** GET /api/tickets/my - Current user's tickets */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TicketResponse>> getMyTickets() {
        return ResponseEntity.ok(ticketService.getMyTickets(SecurityUtils.getCurrentUserId()));
    }

    /** GET /api/tickets/{id} - Get ticket by ID */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketResponse> getById(@PathVariable("id") String id) {
        return ResponseEntity.ok(ticketService.getById(id));
    }

    /** PATCH /api/tickets/{id}/status - Update ticket workflow status */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable("id") String id,
            @Valid @RequestBody TicketStatusUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request, SecurityUtils.getCurrentUserId()));
    }

    /* ---- Comments ---- */

    /** POST /api/tickets/{id}/comments - Add comment */
    @PostMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable("id") String id,
            @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.addComment(id, request, SecurityUtils.getCurrentUserId()));
    }

    /** GET /api/tickets/{id}/comments - Get all comments for a ticket */
    @GetMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable("id") String id) {
        return ResponseEntity.ok(ticketService.getComments(id));
    }

    /** PUT /api/tickets/{ticketId}/comments/{commentId} - Edit own comment */
    @PutMapping("/{ticketId}/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable("ticketId") String ticketId,
            @PathVariable("commentId") String commentId,
            @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.ok(ticketService.updateComment(commentId, request, SecurityUtils.getCurrentUserId()));
    }

    /**
     * DELETE /api/tickets/{ticketId}/comments/{commentId} - Delete comment (own or
     * admin)
     */
    @DeleteMapping("/{ticketId}/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteComment(
            @PathVariable("ticketId") String ticketId,
            @PathVariable("commentId") String commentId) {
        ticketService.deleteComment(commentId, SecurityUtils.getCurrentUserId(), SecurityUtils.isAdmin());
        return ResponseEntity.noContent().build();
    }

    /** DELETE /api/tickets/{id} - Permanent ticket removal (ADMIN only) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}
