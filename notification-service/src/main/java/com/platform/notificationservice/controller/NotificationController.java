package com.platform.notificationservice.controller;

import com.platform.notificationservice.dto.CreateNotificationRequest;
import com.platform.notificationservice.dto.NotificationResponse;
import com.platform.notificationservice.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * POST /api/notifications - Create a new notification
     */
    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(
            @Valid @RequestBody CreateNotificationRequest request) {
        log.info("POST /api/notifications - Creating notification");
        NotificationResponse response = notificationService.createNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/notifications/{id} - Get a notification by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponse> getNotification(@PathVariable Long id) {
        log.info("GET /api/notifications/{}", id);
        NotificationResponse response = notificationService.getNotification(id);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/notifications - Get all notifications
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAllNotifications() {
        log.info("GET /api/notifications - Fetching all notifications");
        List<NotificationResponse> responses = notificationService.getAllNotifications();
        return ResponseEntity.ok(responses);
    }

    /**
     * GET /api/notifications/user/{userId} - Get notifications for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByUser(@PathVariable Long userId) {
        log.info("GET /api/notifications/user/{}", userId);
        List<NotificationResponse> responses = notificationService.getNotificationsByUser(userId);
        return ResponseEntity.ok(responses);
    }

    /**
     * PUT /api/notifications/{id}/read - Mark notification as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        log.info("PUT /api/notifications/{}/read", id);
        NotificationResponse response = notificationService.markAsRead(id);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/notifications/user/{userId}/read-all - Mark all notifications as read for user
     */
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<List<NotificationResponse>> markAllAsRead(@PathVariable Long userId) {
        log.info("PUT /api/notifications/user/{}/read-all", userId);
        List<NotificationResponse> responses = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(responses);
    }

    /**
     * DELETE /api/notifications/{id} - Delete a notification
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable Long id) {
        log.info("DELETE /api/notifications/{}", id);
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(Map.of("message", "Notification deleted successfully", "id", id.toString()));
    }

    /**
     * GET /api/notifications/unread/count - Get count of unread notifications
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        log.info("GET /api/notifications/unread/count");
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * GET /api/notifications/count - Get total count of notifications
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getTotalCount() {
        log.info("GET /api/notifications/count");
        long count = notificationService.getTotalCount();
        return ResponseEntity.ok(Map.of("count", count));
    }
}
