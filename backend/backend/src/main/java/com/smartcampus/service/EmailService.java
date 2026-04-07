package com.smartcampus.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Async
    public void sendBookingStatusEmail(String toEmail, String userName, String resourceName, String status, String date, String qrCode, String notes) {
        try {
            log.info("Sending HTML email to: {}", toEmail);

            Context context = new Context();
            context.setVariable("userName", userName);
            context.setVariable("resourceName", resourceName);
            context.setVariable("status", status);
            context.setVariable("date", date);
            context.setVariable("qrCode", qrCode);
            context.setVariable("notes", notes != null ? notes : "");

            // Process Thymeleaf template 'booking-status.html'
            String htmlContent = templateEngine.process("booking-status", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Smart Campus - Booking " + status);
            helper.setText(htmlContent, true); // true sets HTML=true

            mailSender.send(message);
            log.info("Email successfully sent to {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send email to {}", toEmail, e);
        } catch (Exception e) {
            log.error("SMTP Configuration missing or incorrect. Failed to send email to {}", toEmail, e);
        }
    }
}
