package com.smartcampus;

import com.smartcampus.domain.Resource;
import com.smartcampus.domain.User;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.ResourceService;
import com.smartcampus.dto.ResourceRequest;
import com.smartcampus.dto.ResourceResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@SuppressWarnings("null")
public class SmartCampusIntegrationTest {

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setup() {
        userRepository.save(User.builder()
                .email("test@campus.edu").name("Test User")
                .role(User.Role.USER).googleId("test-001").build());

        userRepository.save(User.builder()
                .email("admin@campus.edu").name("Admin User")
                .role(User.Role.ADMIN).googleId("admin-001").build());
    }

    @Test
    void testCreateResource() {
        ResourceRequest request = new ResourceRequest();
        request.setName("Test Hall");
        request.setType(Resource.ResourceType.LECTURE_HALL);
        request.setCapacity(50);
        request.setLocation("Block A");
        request.setStatus(Resource.ResourceStatus.ACTIVE);

        ResourceResponse response = resourceService.create(request);

        assertNotNull(response.getId());
        assertEquals("Test Hall", response.getName());
        assertEquals(Resource.ResourceType.LECTURE_HALL, response.getType());
        assertEquals(50, response.getCapacity());
        assertEquals(Resource.ResourceStatus.ACTIVE, response.getStatus());
    }

    @Test
    void testGetAllResourcesWithFilters() {
        // Create resources
        ResourceRequest r1 = new ResourceRequest();
        r1.setName("Lab 1");
        r1.setType(Resource.ResourceType.LAB);
        r1.setCapacity(30);
        r1.setLocation("Block B");
        r1.setStatus(Resource.ResourceStatus.ACTIVE);
        resourceService.create(r1);

        ResourceRequest r2 = new ResourceRequest();
        r2.setName("Hall A");
        r2.setType(Resource.ResourceType.LECTURE_HALL);
        r2.setCapacity(100);
        r2.setLocation("Block A");
        r2.setStatus(Resource.ResourceStatus.ACTIVE);
        resourceService.create(r2);

        // Filter by type
        List<ResourceResponse> labs = resourceService.getAll(Resource.ResourceType.LAB, null, null, null);
        assertThat(labs).hasSize(1);
        assertThat(labs.get(0).getName()).isEqualTo("Lab 1");

        // Filter by minCapacity
        List<ResourceResponse> largeRooms = resourceService.getAll(null, null, null, 50);
        assertThat(largeRooms).hasSize(1);
        assertThat(largeRooms.get(0).getName()).isEqualTo("Hall A");
    }

    @Test
    void testUpdateResourceStatus() {
        ResourceRequest request = new ResourceRequest();
        request.setName("Lab X");
        request.setType(Resource.ResourceType.LAB);
        request.setCapacity(20);
        request.setLocation("Block C");
        request.setStatus(Resource.ResourceStatus.ACTIVE);
        ResourceResponse created = resourceService.create(request);

        ResourceResponse updated = resourceService.updateStatus(created.getId(),
                Resource.ResourceStatus.OUT_OF_SERVICE);

        assertEquals(Resource.ResourceStatus.OUT_OF_SERVICE, updated.getStatus());
    }

    @Test
    void testDeleteResource() {
        ResourceRequest request = new ResourceRequest();
        request.setName("Temp Room");
        request.setType(Resource.ResourceType.MEETING_ROOM);
        request.setCapacity(5);
        request.setLocation("Block D");
        request.setStatus(Resource.ResourceStatus.ACTIVE);
        ResourceResponse created = resourceService.create(request);

        resourceService.delete(created.getId());

        assertFalse(resourceRepository.existsById(created.getId()));
    }
}
