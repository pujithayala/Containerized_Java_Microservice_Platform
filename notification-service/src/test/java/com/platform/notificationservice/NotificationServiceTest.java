package com.platform.notificationservice;

import com.platform.notificationservice.dto.CreateNotificationRequest;
import com.platform.notificationservice.dto.NotificationResponse;
import com.platform.notificationservice.entity.Notification;
import com.platform.notificationservice.entity.NotificationType;
import com.platform.notificationservice.exception.NotificationNotFoundException;
import com.platform.notificationservice.repository.NotificationRepository;
import com.platform.notificationservice.service.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService Unit Tests")
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private Notification sampleNotification;
    private CreateNotificationRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleNotification = Notification.builder()
                .id(1L)
                .userId(100L)
                .orderId(200L)
                .type(NotificationType.ORDER_CREATED)
                .title("Order Created")
                .message("Your order #200 has been created successfully.")
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        sampleRequest = CreateNotificationRequest.builder()
                .userId(100L)
                .orderId(200L)
                .type(NotificationType.ORDER_CREATED)
                .title("Order Created")
                .message("Your order #200 has been created successfully.")
                .build();
    }

    // ─── CREATE ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("createNotification - should save and return notification response")
    void createNotification_success() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(sampleNotification);

        NotificationResponse response = notificationService.createNotification(sampleRequest);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getUserId()).isEqualTo(100L);
        assertThat(response.getOrderId()).isEqualTo(200L);
        assertThat(response.getType()).isEqualTo(NotificationType.ORDER_CREATED);
        assertThat(response.getTitle()).isEqualTo("Order Created");
        assertThat(response.getMessage()).isEqualTo("Your order #200 has been created successfully.");
        assertThat(response.isRead()).isFalse();

        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    // ─── GET BY ID ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getNotification - should return notification when found")
    void getNotification_found() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(sampleNotification));

        NotificationResponse response = notificationService.getNotification(1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        verify(notificationRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("getNotification - should throw NotificationNotFoundException when not found")
    void getNotification_notFound() {
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.getNotification(999L))
                .isInstanceOf(NotificationNotFoundException.class)
                .hasMessageContaining("999");

        verify(notificationRepository, times(1)).findById(999L);
    }

    // ─── GET BY USER ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getNotificationsByUser - should return list of notifications for user")
    void getNotificationsByUser_success() {
        Notification second = Notification.builder()
                .id(2L).userId(100L).orderId(201L)
                .type(NotificationType.ORDER_SHIPPED)
                .title("Order Shipped").message("Your order is on its way.")
                .read(false).createdAt(LocalDateTime.now()).build();

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(100L))
                .thenReturn(List.of(sampleNotification, second));

        List<NotificationResponse> responses = notificationService.getNotificationsByUser(100L);

        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).getUserId()).isEqualTo(100L);
        verify(notificationRepository).findByUserIdOrderByCreatedAtDesc(100L);
    }

    @Test
    @DisplayName("getNotificationsByUser - should return empty list when user has no notifications")
    void getNotificationsByUser_empty() {
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(999L)).thenReturn(List.of());

        List<NotificationResponse> responses = notificationService.getNotificationsByUser(999L);

        assertThat(responses).isEmpty();
    }

    // ─── GET ALL ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllNotifications - should return all notifications")
    void getAllNotifications_success() {
        when(notificationRepository.findAll()).thenReturn(List.of(sampleNotification));

        List<NotificationResponse> responses = notificationService.getAllNotifications();

        assertThat(responses).hasSize(1);
        verify(notificationRepository).findAll();
    }

    // ─── MARK AS READ ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("markAsRead - should mark notification as read and return updated response")
    void markAsRead_success() {
        Notification readNotification = Notification.builder()
                .id(1L).userId(100L).orderId(200L)
                .type(NotificationType.ORDER_CREATED)
                .title("Order Created").message("Your order #200 has been created successfully.")
                .read(true).createdAt(LocalDateTime.now()).build();

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(sampleNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(readNotification);

        NotificationResponse response = notificationService.markAsRead(1L);

        assertThat(response.isRead()).isTrue();
        verify(notificationRepository).findById(1L);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    @DisplayName("markAsRead - should throw NotificationNotFoundException when not found")
    void markAsRead_notFound() {
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(999L))
                .isInstanceOf(NotificationNotFoundException.class);
    }

    // ─── MARK ALL AS READ ────────────────────────────────────────────────────

    @Test
    @DisplayName("markAllAsRead - should mark all user notifications as read")
    void markAllAsRead_success() {
        Notification n1 = Notification.builder().id(1L).userId(100L).orderId(200L)
                .type(NotificationType.ORDER_CREATED).title("T1").message("M1")
                .read(false).createdAt(LocalDateTime.now()).build();
        Notification n2 = Notification.builder().id(2L).userId(100L).orderId(201L)
                .type(NotificationType.ORDER_SHIPPED).title("T2").message("M2")
                .read(false).createdAt(LocalDateTime.now()).build();

        when(notificationRepository.findByUserId(100L)).thenReturn(List.of(n1, n2));
        when(notificationRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        List<NotificationResponse> responses = notificationService.markAllAsRead(100L);

        assertThat(responses).hasSize(2);
        assertThat(responses).allMatch(NotificationResponse::isRead);
    }

    // ─── UNREAD COUNT ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("getUnreadCount - should return count of unread notifications")
    void getUnreadCount_success() {
        when(notificationRepository.countByReadFalse()).thenReturn(5L);

        long count = notificationService.getUnreadCount();

        assertThat(count).isEqualTo(5L);
        verify(notificationRepository).countByReadFalse();
    }

    // ─── TOTAL COUNT ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getTotalCount - should return total count of notifications")
    void getTotalCount_success() {
        when(notificationRepository.count()).thenReturn(10L);

        long count = notificationService.getTotalCount();

        assertThat(count).isEqualTo(10L);
        verify(notificationRepository).count();
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteNotification - should delete notification when found")
    void deleteNotification_success() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(sampleNotification));
        doNothing().when(notificationRepository).delete(sampleNotification);

        assertThatCode(() -> notificationService.deleteNotification(1L))
                .doesNotThrowAnyException();

        verify(notificationRepository).findById(1L);
        verify(notificationRepository).delete(sampleNotification);
    }

    @Test
    @DisplayName("deleteNotification - should throw NotificationNotFoundException when not found")
    void deleteNotification_notFound() {
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.deleteNotification(999L))
                .isInstanceOf(NotificationNotFoundException.class)
                .hasMessageContaining("999");

        verify(notificationRepository, never()).delete(any());
    }
}
