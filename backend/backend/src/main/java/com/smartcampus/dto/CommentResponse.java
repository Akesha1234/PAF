package com.smartcampus.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentResponse {
    private String id;
    private String ticketId;
    private String authorId;
    private String authorName;
    private String authorPictureUrl;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
