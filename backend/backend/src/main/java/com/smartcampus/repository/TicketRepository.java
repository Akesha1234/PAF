package com.smartcampus.repository;

import com.smartcampus.domain.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String>,
        JpaSpecificationExecutor<Ticket> {

    List<Ticket> findByReporterId(String reporterId);

    List<Ticket> findByAssigneeId(String assigneeId);

    List<Ticket> findByStatus(Ticket.TicketStatus status);

    List<Ticket> findByPriority(Ticket.TicketPriority priority);

    List<Ticket> findByResourceId(String resourceId);

    List<Ticket> findByCategory(Ticket.TicketCategory category);
}
