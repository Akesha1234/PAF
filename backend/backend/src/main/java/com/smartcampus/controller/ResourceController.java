package com.smartcampus.controller;

import com.smartcampus.domain.Resource;
import com.smartcampus.dto.ResourceRequest;
import com.smartcampus.dto.ResourceResponse;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Module A – Facilities & Assets Catalogue
 * Member 1 endpoints
 */
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    /** GET /api/resources - List all resources with optional filters */
    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAll(
            @RequestParam(name = "type", required = false) Resource.ResourceType type,
            @RequestParam(name = "status", required = false) Resource.ResourceStatus status,
            @RequestParam(name = "location", required = false) String location,
            @RequestParam(name = "minCapacity", required = false) Integer minCapacity) {
        return ResponseEntity.ok(resourceService.getAll(type, status, location, minCapacity));
    }

    /** GET /api/resources/{id} - Get resource by ID */
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getById(@PathVariable("id") String id) {
        return ResponseEntity.ok(resourceService.getById(id));
    }

    /** POST /api/resources - Create new resource (ADMIN only) */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> create(@Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.create(request));
    }

    /** PUT /api/resources/{id} - Update resource (ADMIN only) */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> update(@PathVariable("id") String id,
            @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.update(id, request));
    }

    /** DELETE /api/resources/{id} - Delete resource (ADMIN only) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** PATCH /api/resources/{id}/status - Update resource status (ADMIN only) */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> updateStatus(@PathVariable("id") String id,
            @RequestParam("status") Resource.ResourceStatus status) {
        return ResponseEntity.ok(resourceService.updateStatus(id, status));
    }
}
