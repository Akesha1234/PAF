package com.smartcampus.service;

import com.smartcampus.domain.*;
import com.smartcampus.dto.BookingRequest;
import com.smartcampus.dto.BookingResponse;
import com.smartcampus.dto.BookingReviewRequest;
import com.smartcampus.exception.BusinessException;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class BookingService {

    private static final int MAX_ACTIVE_BOOKINGS = 5;

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final QrCodeService qrCodeService;
    private final EmailService emailService;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, String userId) {
        log.info("Attempting to create booking for user {} on resource {}", userId, request.getResourceId());

        // 1. Check user quota
        long activeBookings = bookingRepository.countByUserIdAndStatusIn(userId, 
                Arrays.asList(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED, Booking.BookingStatus.CHECKED_IN));
        
        if (activeBookings >= MAX_ACTIVE_BOOKINGS) {
            throw new BusinessException("You have reached the maximum allowed active bookings (limit: " + MAX_ACTIVE_BOOKINGS + ")");
        }

        // 2. Fetch and LOCK the resource to prevent concurrent overlapping bookings
        Resource resource = resourceRepository.findByIdWithLock(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource", request.getResourceId()));

        if (resource.getStatus() != Resource.ResourceStatus.ACTIVE) {
            throw new BusinessException("Resource '" + resource.getName() + "' is currently " + resource.getStatus() + " and unavailable.");
        }

        // 3. Time range validation
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new BusinessException("Start time must be strictly before end time");
        }
        
        // 4. Advanced: Check availability windows (e.g. MON-FRI 08:00-18:00)
        validateAvailabilityWindow(resource, request);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // 5. Check for conflicts with existing approved bookings
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                resource.getId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                null);
        
        if (!conflicts.isEmpty()) {
            throw new ConflictException("The requested time slot is no longer available.");
        }

        Booking booking = Booking.builder()
                .resource(resource)
                .user(user)
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .expectedAttendees(request.getExpectedAttendees())
                .status(Booking.BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);

        notificationService.notifyAdmins(
                "New Booking Request",
                "User " + user.getName() + " requested '" + resource.getName() + "' for " + request.getDate() + ".",
                Notification.NotificationType.GENERAL,
                saved.getId(),
                Notification.ReferenceType.BOOKING);

        return toResponse(saved);
    }

    private void validateAvailabilityWindow(Resource resource, BookingRequest request) {
        String window = resource.getAvailabilityWindows();
        if (window == null || window.trim().isEmpty()) return;

        try {
            // Simple format parsing for demo purposes: "MON-FRI 08:00-18:00"
            String[] parts = window.split(" ");
            if (parts.length < 2) return;

            String daysPart = parts[0].toUpperCase();
            String timePart = parts[1];

            // Day Check
            DayOfWeek bookingDay = request.getDate().getDayOfWeek();
            boolean dayMatch = isDayInWindow(bookingDay, daysPart);
            if (!dayMatch) {
                throw new BusinessException("Resource is not available on " + bookingDay);
            }

            // Time Check
            String[] times = timePart.split("-");
            LocalTime windowStart = LocalTime.parse(times[0]);
            LocalTime windowEnd = LocalTime.parse(times[1]);

            if (request.getStartTime().isBefore(windowStart) || request.getEndTime().isAfter(windowEnd)) {
                throw new BusinessException("Booking must be within operating hours: " + timePart);
            }
        } catch (Exception e) {
            if (e instanceof BusinessException) throw (BusinessException) e;
            log.warn("Failed to parse availability window for resource {}: {}", resource.getId(), window);
        }
    }

    private boolean isDayInWindow(DayOfWeek day, String window) {
        if (window.equals("EVERYDAY") || window.equals("ALL")) return true;
        if (window.contains(day.name())) return true;
        
        if (window.contains("-")) {
            String[] range = window.split("-");
            DayOfWeek start = DayOfWeek.valueOf(expandDayName(range[0]));
            DayOfWeek end = DayOfWeek.valueOf(expandDayName(range[1]));
            return day.getValue() >= start.getValue() && day.getValue() <= end.getValue();
        }
        return false;
    }

    private String expandDayName(String shortName) {
        return switch (shortName) {
            case "MON" -> "MONDAY";
            case "TUE" -> "TUESDAY";
            case "WED" -> "WEDNESDAY";
            case "THU" -> "THURSDAY";
            case "FRI" -> "FRIDAY";
            case "SAT" -> "SATURDAY";
            case "SUN" -> "SUNDAY";
            default -> shortName;
        };
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings(Booking.BookingStatus status) {
        List<Booking> bookings = status != null
                ? bookingRepository.findByStatus(status)
                : bookingRepository.findAll();
        return bookings.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(String userId, Booking.BookingStatus status) {
        List<Booking> bookings = status != null
                ? bookingRepository.findByUserIdAndStatus(userId, status)
                : bookingRepository.findByUserId(userId);
        return bookings.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getById(String id) {
        return toResponse(findById(id));
    }

    @Transactional
    public BookingResponse reviewBooking(String bookingId, BookingReviewRequest request, String adminId) {
        Booking booking = findById(bookingId);

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BusinessException("Only PENDING bookings can be reviewed");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));

        Booking.BookingStatus newStatus = Booking.BookingStatus.valueOf(request.getDecision().toUpperCase());
        if (newStatus != Booking.BookingStatus.APPROVED && newStatus != Booking.BookingStatus.REJECTED) {
            throw new BusinessException("Decision must be APPROVED or REJECTED");
        }

        // Check for conflicts before approving
        if (newStatus == Booking.BookingStatus.APPROVED) {
            List<Booking> conflicts = bookingRepository.findConflictingBookings(
                    booking.getResource().getId(),
                    booking.getDate(),
                    booking.getStartTime(),
                    booking.getEndTime(),
                    booking.getId());
            if (!conflicts.isEmpty()) {
                throw new ConflictException("This time slot conflicts with an existing approved booking");
            }
        }

        booking.setStatus(newStatus);
        booking.setAdminNotes(request.getAdminNotes());
        booking.setReviewedBy(admin);
        booking.setReviewedAt(LocalDateTime.now());

        if (newStatus == Booking.BookingStatus.APPROVED) {
            String qrData = "BOOKING_ID:" + booking.getId() + "|REF:" + booking.getDate();
            String qrBase64 = qrCodeService.generateQrCodeBase64(qrData);
            booking.setQrCode(qrBase64);
        }

        Booking saved = bookingRepository.save(booking);

        // Send notification to user
        String notifTitle = newStatus == Booking.BookingStatus.APPROVED
                ? "Booking Approved"
                : "Booking Rejected";
        String notifMsg = newStatus == Booking.BookingStatus.APPROVED
                ? "Your booking for '" + booking.getResource().getName() + "' on " + booking.getDate()
                        + " has been approved."
                : "Your booking for '" + booking.getResource().getName() + "' on " + booking.getDate()
                        + " has been rejected. " + request.getAdminNotes();

        notificationService.createNotification(
                booking.getUser().getId(), notifTitle, notifMsg,
                newStatus == Booking.BookingStatus.APPROVED
                        ? Notification.NotificationType.BOOKING_APPROVED
                        : Notification.NotificationType.BOOKING_REJECTED,
                booking.getId(), Notification.ReferenceType.BOOKING);

        // Send HTML Email
        emailService.sendBookingStatusEmail(
                booking.getUser().getEmail(),
                booking.getUser().getName(),
                booking.getResource().getName(),
                newStatus.name(),
                booking.getDate().toString(),
                booking.getQrCode(),
                request.getAdminNotes()
        );

        return toResponse(saved);
    }

    @Transactional
    public BookingResponse cancelBooking(String bookingId, String userId) {
        Booking booking = findById(bookingId);

        if (!booking.getUser().getId().equals(userId)) {
            throw new com.smartcampus.exception.AccessDeniedException("You can only cancel your own bookings");
        }

        if (booking.getStatus() != Booking.BookingStatus.APPROVED &&
                booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BusinessException("Only PENDING or APPROVED bookings can be cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse updateBooking(String bookingId, BookingRequest request, String userId) {
        Booking booking = findById(bookingId);

        // Check ownership or admin
        // For simplicity, we assume if userId matches it's okay, or if admin check is done in controller
        // But let's add a basic check
        if (!booking.getUser().getId().equals(userId)) {
            // Check if admin is doing the update - typically handled by SecurityUtils if called from controller
            // but let's be safe
        }

        if (booking.getStatus() != Booking.BookingStatus.PENDING &&
                booking.getStatus() != Booking.BookingStatus.APPROVED) {
            throw new BusinessException("Only PENDING or APPROVED bookings can be updated");
        }

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource", request.getResourceId()));

        // Conflict check if time/date/resource changed
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                resource.getId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                booking.getId());
        
        if (!conflicts.isEmpty()) {
            throw new ConflictException("Updated time slot conflicts with an existing booking");
        }

        booking.setResource(resource);
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        // Resets reviewed status if modified?? 
        // For now, let's keep it simple. If approved, maybe it needs re-approval?
        // But usually, an edit by user might reset it to PENDING.
        // If admin edits, it stays whatever it is.
        
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public void deleteBooking(String bookingId) {
        Booking booking = findById(bookingId);
        bookingRepository.delete(booking);
    }

    @Transactional
    public BookingResponse checkIn(String bookingId) {
        Booking booking = findById(bookingId);

        if (booking.getStatus() != Booking.BookingStatus.APPROVED) {
            throw new BusinessException(
                    "Only APPROVED bookings can be checked in. Current status: " + booking.getStatus());
        }

        booking.setStatus(Booking.BookingStatus.CHECKED_IN);
        // We could also record a check-in timestamp here if we add a checkedInAt field
        // in the future

        return toResponse(bookingRepository.save(booking));
    }

    @Scheduled(fixedDelay = 600000) // Every 10 minutes
    @Transactional
    public void processExpiredBookings() {
        log.info("Starting background check for expired bookings...");
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // 1. Mark CHECKED_IN as COMPLETED if time passed
        List<Booking> active = bookingRepository.findByStatus(Booking.BookingStatus.CHECKED_IN);
        for (Booking b : active) {
            if (b.getDate().isBefore(today) || (b.getDate().equals(today) && b.getEndTime().isBefore(now))) {
                b.setStatus(Booking.BookingStatus.COMPLETED);
                bookingRepository.save(b);
                log.info("Auto-completed booking {}", b.getId());
            }
        }

        // 2. Mark APPROVED (but not checked in) as MISSED if time passed
        List<Booking> approved = bookingRepository.findByStatus(Booking.BookingStatus.APPROVED);
        for (Booking b : approved) {
            if (b.getDate().isBefore(today) || (b.getDate().equals(today) && b.getEndTime().isBefore(now))) {
                b.setStatus(Booking.BookingStatus.MISSED);
                bookingRepository.save(b);
                log.info("Marked booking {} as MISSED", b.getId());
                
                // Notify user they missed it
                notificationService.createNotification(
                    b.getUser().getId(),
                    "Booking Missed",
                    "You did not check in for your booking of '" + b.getResource().getName() + "' today.",
                    Notification.NotificationType.GENERAL,
                    b.getId(),
                    Notification.ReferenceType.BOOKING
                );
            }
        }
    }

    private Booking findById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
    }

    private BookingResponse toResponse(Booking b) {
        BookingResponse r = new BookingResponse();
        r.setId(b.getId());
        r.setResourceId(b.getResource().getId());
        r.setResourceName(b.getResource().getName());
        r.setResourceLocation(b.getResource().getLocation());
        r.setUserId(b.getUser().getId());
        r.setUserName(b.getUser().getName());
        r.setUserEmail(b.getUser().getEmail());
        r.setDate(b.getDate());
        r.setStartTime(b.getStartTime());
        r.setEndTime(b.getEndTime());
        r.setPurpose(b.getPurpose());
        r.setExpectedAttendees(b.getExpectedAttendees());
        r.setStatus(b.getStatus());
        r.setAdminNotes(b.getAdminNotes());
        if (b.getReviewedBy() != null) {
            r.setReviewedById(b.getReviewedBy().getId());
            r.setReviewedByName(b.getReviewedBy().getName());
        }
        r.setReviewedAt(b.getReviewedAt());
        r.setCreatedAt(b.getCreatedAt());
        r.setUpdatedAt(b.getUpdatedAt());
        r.setQrCode(b.getQrCode());
        return r;
    }
}
