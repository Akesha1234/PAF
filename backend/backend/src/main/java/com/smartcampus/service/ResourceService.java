package com.smartcampus.service;

import com.smartcampus.domain.Resource;
import com.smartcampus.dto.ResourceRequest;
import com.smartcampus.dto.ResourceResponse;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ResourceService {

    private final ResourceRepository resourceRepository;

    @Transactional(readOnly = true)
    public List<ResourceResponse> getAll(Resource.ResourceType type,
            Resource.ResourceStatus status,
            String location,
            Integer minCapacity) {
        List<Resource> resources = resourceRepository.findAll();

        return resources.stream()
                .filter(r -> type == null || r.getType() == type)
                .filter(r -> status == null || r.getStatus() == status)
                .filter(r -> location == null || (r.getLocation() != null &&
                        r.getLocation().toLowerCase().contains(location.toLowerCase())))
                .filter(r -> minCapacity == null || (r.getCapacity() != null &&
                        r.getCapacity() >= minCapacity))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ResourceResponse getById(String id) {
        return toResponse(findById(id));
    }

    @Transactional
    public ResourceResponse create(ResourceRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .description(request.getDescription())
                .availabilityWindows(request.getAvailabilityWindows())
                .status(request.getStatus())
                .build();
        return toResponse(resourceRepository.save(resource));
    }

    @Transactional
    public ResourceResponse update(String id, ResourceRequest request) {
        Resource resource = findById(id);
        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setDescription(request.getDescription());
        resource.setAvailabilityWindows(request.getAvailabilityWindows());
        resource.setStatus(request.getStatus());
        return toResponse(resourceRepository.save(resource));
    }

    @Transactional
    public void delete(String id) {
        Resource resource = findById(id);
        resourceRepository.delete(resource);
    }

    @Transactional
    public ResourceResponse updateStatus(String id, Resource.ResourceStatus status) {
        Resource resource = findById(id);
        resource.setStatus(status);
        return toResponse(resourceRepository.save(resource));
    }

    private Resource findById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", id));
    }

    public ResourceResponse toResponse(Resource r) {
        ResourceResponse res = new ResourceResponse();
        res.setId(r.getId());
        res.setName(r.getName());
        res.setType(r.getType());
        res.setCapacity(r.getCapacity());
        res.setLocation(r.getLocation());
        res.setDescription(r.getDescription());
        res.setAvailabilityWindows(r.getAvailabilityWindows());
        res.setStatus(r.getStatus());
        res.setCreatedAt(r.getCreatedAt());
        res.setUpdatedAt(r.getUpdatedAt());
        return res;
    }
}
