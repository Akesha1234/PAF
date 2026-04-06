package com.smartcampus.dto;

import com.smartcampus.domain.Resource;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResourceRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Resource type is required")
    private Resource.ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;

    private String availabilityWindows;

    @NotNull(message = "Status is required")
    private Resource.ResourceStatus status;
}
