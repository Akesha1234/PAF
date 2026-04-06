package com.smartcampus.exception;

import com.smartcampus.dto.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex, HttpServletRequest req) {
        return buildError(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), req.getRequestURI(), null);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiError> handleConflict(ConflictException ex, HttpServletRequest req) {
        return buildError(HttpStatus.CONFLICT, "Conflict", ex.getMessage(), req.getRequestURI(), null);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiError> handleBusiness(BusinessException ex, HttpServletRequest req) {
        return buildError(HttpStatus.UNPROCESSABLE_ENTITY, "Business Rule Violation", ex.getMessage(),
                req.getRequestURI(), null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return buildError(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage(), req.getRequestURI(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        List<ApiError.FieldError> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ApiError.FieldError(fe.getField(), fe.getDefaultMessage()))
                .collect(Collectors.toList());
        return buildError(HttpStatus.BAD_REQUEST, "Validation Failed", "Request validation failed", req.getRequestURI(),
                fieldErrors);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest req) {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", ex.getMessage(),
                req.getRequestURI(), null);
    }

    private ResponseEntity<ApiError> buildError(HttpStatus status, String error, String message,
            String path, List<ApiError.FieldError> fieldErrors) {
        ApiError apiError = new ApiError();
        apiError.setStatus(status.value());
        apiError.setError(error);
        apiError.setMessage(message);
        apiError.setPath(path);
        apiError.setFieldErrors(fieldErrors);
        return ResponseEntity.status(status).body(apiError);
    }
}
