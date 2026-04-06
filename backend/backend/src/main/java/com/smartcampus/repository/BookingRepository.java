package com.smartcampus.repository;

import com.smartcampus.domain.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {

    List<Booking> findByUserId(String userId);

    List<Booking> findByResourceId(String resourceId);

    List<Booking> findByStatus(Booking.BookingStatus status);

    /** Check for overlapping approved bookings on the same resource */
    @Query("""
            SELECT b FROM Booking b
            WHERE b.resource.id = :resourceId
              AND b.date = :date
              AND b.status = 'APPROVED'
              AND b.startTime < :endTime
              AND b.endTime > :startTime
              AND (:excludeId IS NULL OR b.id != :excludeId)
            """)
    List<Booking> findConflictingBookings(
            @Param("resourceId") String resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") String excludeId);

    List<Booking> findByUserIdAndStatus(String userId, Booking.BookingStatus status);

    List<Booking> findByResourceIdAndDate(String resourceId, LocalDate date);
}
