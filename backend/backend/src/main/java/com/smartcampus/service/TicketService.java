package com.smartcampus.service;

import com.smartcampus.domain.*;
import com.smartcampus.dto.*;
import com.smartcampus.exception.AccessDeniedException;
import com.smartcampus.exception.BusinessException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.CommentRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class TicketService {

    private final TicketRepository ticketRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Transactional
    public TicketResponse createTicket(TicketRequest request, List<MultipartFile> files, String reporterId) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", reporterId));

        Resource resource = null;
        if (request.getResourceId() != null && !request.getResourceId().isBlank()) {
            resource = resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource", request.getResourceId()));
        }

        // Handle file uploads (max 3)
        List<String> savedPaths = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            if (files.size() > 3) {
                throw new BusinessException("Maximum 3 image attachments allowed");
            }
            for (MultipartFile file : files) {
                savedPaths.add(saveFile(file));
            }
        }

        Ticket ticket = Ticket.builder()
                .resource(resource)
                .reporter(reporter)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(Ticket.TicketStatus.OPEN)
                .location(request.getLocation())
                .contactName(request.getContactName())
                .contactPhone(request.getContactPhone())
                .contactEmail(request.getContactEmail())
                .attachmentPaths(savedPaths.isEmpty() ? null : String.join(";", savedPaths))
                .build();

        Ticket saved = ticketRepository.save(ticket);

        // Notify Admins of new incident
        notificationService.notifyAdmins(
                "New Support Incident",
                "User " + reporter.getName() + " reported: '" + ticket.getTitle() + "' at " + (ticket.getLocation() != null ? ticket.getLocation() : "Unknown"),
                Notification.NotificationType.GENERAL,
                saved.getId(),
                Notification.ReferenceType.TICKET);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets(Ticket.TicketStatus status,
            Ticket.TicketPriority priority,
            Ticket.TicketCategory category) {
        return ticketRepository.findAll().stream()
                .filter(t -> status == null || t.getStatus() == status)
                .filter(t -> priority == null || t.getPriority() == priority)
                .filter(t -> category == null || t.getCategory() == category)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getMyTickets(String userId) {
        return ticketRepository.findByReporterId(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TicketResponse getById(String id) {
        return toResponse(findById(id));
    }

    @Transactional
    public TicketResponse updateStatus(String ticketId, TicketStatusUpdateRequest request, String operatorId) {
        Ticket ticket = findById(ticketId);
        User operator = userRepository.findById(operatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", operatorId));

        Ticket.TicketStatus oldStatus = ticket.getStatus();
        Ticket.TicketStatus newStatus = request.getStatus();

        // Validate workflow transitions
        validateStatusTransition(oldStatus, newStatus, operator);

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User (assignee)", request.getAssigneeId()));
            ticket.setAssignee(assignee);
            if (ticket.getStatus() == Ticket.TicketStatus.OPEN) {
                ticket.setStatus(Ticket.TicketStatus.IN_PROGRESS);
            }
            
            // Notify Technician of assignment
            notificationService.createNotification(
                assignee.getId(),
                "New Task Assigned",
                "You have been assigned to incident: '" + ticket.getTitle() + "' at " + ticket.getLocation(),
                Notification.NotificationType.TICKET_ASSIGNED,
                ticket.getId(),
                Notification.ReferenceType.TICKET
            );
        }

        if (newStatus == Ticket.TicketStatus.IN_PROGRESS && ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(LocalDateTime.now());
        }

        ticket.setStatus(newStatus);

        if (newStatus == Ticket.TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
            if (request.getResolutionNotes() != null) {
                ticket.setResolutionNotes(request.getResolutionNotes());
            }
        }
        if (newStatus == Ticket.TicketStatus.REJECTED && request.getRejectionReason() != null) {
            ticket.setRejectionReason(request.getRejectionReason());
        }

        Ticket saved = ticketRepository.save(ticket);

        // SYNC: Update resource status if ticket is on a specific resource
        if (ticket.getResource() != null) {
            Resource res = ticket.getResource();
            if (newStatus == Ticket.TicketStatus.IN_PROGRESS) {
                res.setStatus(Resource.ResourceStatus.MAINTENANCE);
            } else if (newStatus == Ticket.TicketStatus.RESOLVED || newStatus == Ticket.TicketStatus.CLOSED) {
                // Return to ACTIVE if no other OPEN or IN_PROGRESS tickets exist for this resource
                // (Advanced check, for now just set to ACTIVE)
                res.setStatus(Resource.ResourceStatus.ACTIVE);
            }
            resourceRepository.save(res);
        }

        // Notify reporter
        notificationService.createNotification(
                ticket.getReporter().getId(),
                "Ticket Status Updated",
                "Your ticket '" + ticket.getTitle() + "' status changed from " + oldStatus + " to " + newStatus,
                Notification.NotificationType.TICKET_STATUS_CHANGED,
                ticket.getId(), Notification.ReferenceType.TICKET);

        return toResponse(saved);
    }

    @Transactional
    public CommentResponse addComment(String ticketId, CommentRequest request, String authorId) {
        Ticket ticket = findById(ticketId);
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", authorId));

        Comment comment = Comment.builder()
                .ticket(ticket)
                .author(author)
                .content(request.getContent())
                .build();

        Comment saved = commentRepository.save(comment);

        // Notify ticket reporter if commenter is someone else
        if (!authorId.equals(ticket.getReporter().getId())) {
            notificationService.createNotification(
                    ticket.getReporter().getId(),
                    "New Comment on Your Ticket",
                    author.getName() + " commented on your ticket '" + ticket.getTitle() + "'",
                    Notification.NotificationType.TICKET_COMMENT_ADDED,
                    ticket.getId(), Notification.ReferenceType.TICKET);
        }

        return toCommentResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(String ticketId) {
        findById(ticketId); // validate ticket exists
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream().map(this::toCommentResponse).collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse updateComment(String commentId, CommentRequest request, String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new AccessDeniedException("You can only edit your own comments");
        }
        comment.setContent(request.getContent());
        return toCommentResponse(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(String commentId, String userId, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        if (!isAdmin && !comment.getAuthor().getId().equals(userId)) {
            throw new AccessDeniedException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }

    @Transactional
    public void deleteTicket(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));
        ticketRepository.delete(ticket);
    }

    private void validateStatusTransition(Ticket.TicketStatus from, Ticket.TicketStatus to, User operator) {
        if (from == to) return;

        boolean canTransition = switch (from) {
            case OPEN -> to == Ticket.TicketStatus.IN_PROGRESS || to == Ticket.TicketStatus.REJECTED;
            case IN_PROGRESS -> to == Ticket.TicketStatus.RESOLVED || to == Ticket.TicketStatus.REJECTED;
            case RESOLVED -> to == Ticket.TicketStatus.CLOSED;
            default -> false;
        };
        if (!canTransition) {
            throw new BusinessException("Invalid status transition from " + from + " to " + to);
        }
    }

    private String saveFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            String fileName = UUID.randomUUID() + "_"
                    + StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            Path targetLocation = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException ex) {
            throw new BusinessException("Failed to store file: " + ex.getMessage());
        }
    }

    private Ticket findById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));
    }

    private TicketResponse toResponse(Ticket t) {
        TicketResponse r = new TicketResponse();
        r.setId(t.getId());
        if (t.getResource() != null) {
            r.setResourceId(t.getResource().getId());
            r.setResourceName(t.getResource().getName());
        }
        r.setReporterId(t.getReporter().getId());
        r.setReporterName(t.getReporter().getName());
        r.setReporterEmail(t.getReporter().getEmail());
        if (t.getAssignee() != null) {
            r.setAssigneeId(t.getAssignee().getId());
            r.setAssigneeName(t.getAssignee().getName());
        }
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setCategory(t.getCategory());
        r.setPriority(t.getPriority());
        r.setStatus(t.getStatus());
        r.setLocation(t.getLocation());
        r.setContactName(t.getContactName());
        r.setContactPhone(t.getContactPhone());
        r.setContactEmail(t.getContactEmail());
        r.setResolutionNotes(t.getResolutionNotes());
        r.setRejectionReason(t.getRejectionReason());
        if (t.getAttachmentPaths() != null && !t.getAttachmentPaths().isBlank()) {
            r.setAttachmentUrls(Arrays.asList(t.getAttachmentPaths().split(";")));
        } else {
            r.setAttachmentUrls(new ArrayList<>());
        }
        r.setResolvedAt(t.getResolvedAt());
        r.setFirstResponseAt(t.getFirstResponseAt());
        r.setCreatedAt(t.getCreatedAt());
        r.setUpdatedAt(t.getUpdatedAt());
        r.setCommentsCount(t.getComments().size());
        return r;
    }

    private CommentResponse toCommentResponse(Comment c) {
        CommentResponse r = new CommentResponse();
        r.setId(c.getId());
        r.setTicketId(c.getTicket().getId());
        r.setAuthorId(c.getAuthor().getId());
        r.setAuthorName(c.getAuthor().getName());
        r.setAuthorPictureUrl(c.getAuthor().getPictureUrl());
        r.setContent(c.getContent());
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }
}
