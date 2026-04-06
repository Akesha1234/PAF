package com.smartcampus.dto;

import lombok.Data;

import java.util.List;

@Data
public class ApiError {
    private int status;
    private String error;
    private String message;
    private String path;
    private List<FieldError> fieldErrors;

    @Data
    public static class FieldError {
        private String field;
        private String message;

        public FieldError(String field, String message) {
            this.field = field;
            this.message = message;
        }
    }
}
