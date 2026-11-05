package com.platform.notificationservice.service;

import com.platform.notificationservice.dto.CreateNotificationRequest;
import com.platform.notificationservice.dto.NotificationResponse;
import com.platform.notificationservice.entity.Notification;
import com.platform.notificationservice.exception.NotificationNotFoundException;
import com.platform.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public NotificationResponse createNotification(CreateNotificationRequest request) {
        log.info("Creating notification for userId={}, type={}", request.getUserId(), request.getType());
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .orderId(request.getOrderId())
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .read(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Notification created with id={}", saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getNotification(Long id) {
        log.info("Fetching notification with id={}", id);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));
        return toResponse(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsByUser(Long userId) {
        log.info("Fetching notifications for userId={}", userId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getAllNotifications() {
        log.info("Fetching all notifications");
        return notificationRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationResponse markAsRead(Long id) {
        log.info("Marking notification id={} as read", id);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));
        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return toResponse(saved);
    }

    @Override
    public List<NotificationResponse> markAllAsRead(Long userId) {
        log.info("Marking all notifications as read for userId={}", userId);
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        notifications.forEach(n -> n.setRead(true));
        List<Notification> saved = notificationRepository.saveAll(notifications);
        return saved.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        long count = notificationRepository.countByReadFalse();
        log.info("Unread notification count: {}", count);
        return count;
    }

    @Override
    @Transactional(readOnly = true)
    public long getTotalCount() {
        long count = notificationRepository.count();
        log.info("Total notification count: {}", count);
        return count;
    }

    @Override
    public void deleteNotification(Long id) {
        log.info("Deleting notification id={}", id);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));
        notificationRepository.delete(notification);
        log.info("Notification id={} deleted", id);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .orderId(notification.getOrderId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
