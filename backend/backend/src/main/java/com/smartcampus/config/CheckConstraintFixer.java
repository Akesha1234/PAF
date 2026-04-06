package com.smartcampus.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class CheckConstraintFixer {

    @Bean
    public CommandLineRunner fixCheckConstraint(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;");
                log.info("Successfully dropped bookings_status_check constraint!");
            } catch (Exception e) {
                log.warn("Failed to drop check constraint. It may not exist. " + e.getMessage());
            }
        };
    }
}
