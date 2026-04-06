package com.smartcampus.config;

import com.smartcampus.domain.Resource;
import com.smartcampus.domain.User;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Seeds initial development data.
 * Only runs when the "dev" profile is active.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class DataSeeder implements CommandLineRunner {

        private final UserRepository userRepository;
        private final ResourceRepository resourceRepository;

        @Override
        public void run(String... args) {
                seedUsers();
                seedResources();
                log.info("✅ Development data seeded successfully");
        }

        private void seedUsers() {
                if (userRepository.count() > 0)
                        return;

                userRepository.save(User.builder()
                                .email("admin@campus.edu").name("Admin User")
                                .role(User.Role.ADMIN).googleId("admin-001").build());

                userRepository.save(User.builder()
                                .email("tech@campus.edu").name("Tech Rajesh")
                                .role(User.Role.TECHNICIAN).googleId("tech-001").build());

                userRepository.save(User.builder()
                                .email("student@campus.edu").name("Student Priya")
                                .role(User.Role.USER).googleId("user-001").build());

                log.info("👤 Seeded 3 users");
        }

        private void seedResources() {
                if (resourceRepository.count() > 0)
                        return;

                resourceRepository.save(Resource.builder()
                                .name("Lecture Hall A").type(Resource.ResourceType.LECTURE_HALL)
                                .capacity(120).location("Block A, Floor 1")
                                .description("Large auditorium-style lecture hall with projection equipment")
                                .availabilityWindows("MON-FRI 08:00-20:00")
                                .status(Resource.ResourceStatus.ACTIVE).build());

                resourceRepository.save(Resource.builder()
                                .name("Computer Lab 1").type(Resource.ResourceType.LAB)
                                .capacity(40).location("Block B, Floor 2")
                                .description("40-seat computer lab with high-speed internet")
                                .availabilityWindows("MON-SAT 08:00-18:00")
                                .status(Resource.ResourceStatus.ACTIVE).build());

                resourceRepository.save(Resource.builder()
                                .name("Meeting Room M1").type(Resource.ResourceType.MEETING_ROOM)
                                .capacity(10).location("Block C, Floor 3")
                                .description("Small meeting room with whiteboard and video conferencing")
                                .availabilityWindows("MON-FRI 09:00-17:00")
                                .status(Resource.ResourceStatus.ACTIVE).build());

                resourceRepository.save(Resource.builder()
                                .name("Sony 4K Projector").type(Resource.ResourceType.EQUIPMENT)
                                .capacity(null).location("AV Storage Room, Block A")
                                .description("Portable 4K projector for events")
                                .availabilityWindows("MON-FRI 08:00-20:00")
                                .status(Resource.ResourceStatus.ACTIVE).build());

                resourceRepository.save(Resource.builder()
                                .name("Research Lab R2").type(Resource.ResourceType.LAB)
                                .capacity(20).location("Block D, Floor 1")
                                .description("Advanced research lab - currently under maintenance")
                                .availabilityWindows("MON-FRI 09:00-17:00")
                                .status(Resource.ResourceStatus.OUT_OF_SERVICE).build());

                log.info("🏛️  Seeded 5 resources");
        }
}
