package com.smartcampus.dto;

import com.smartcampus.domain.Resource;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ResourceResponse {
    private String id;
    private String name;
    private Resource.ResourceType type;
    private Integer capacity;
    private String location;
    private String description;
    private String availabilityWindows;
    private Resource.ResourceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
