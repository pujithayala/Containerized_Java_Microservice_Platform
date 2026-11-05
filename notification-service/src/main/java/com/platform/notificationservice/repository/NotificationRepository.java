package com.platform.notificationservice.repository;

import com.platform.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByReadFalse();

    List<Notification> findByUserId(Long userId);

    long countByReadFalse();

    List<Notification> findByOrderId(Long orderId);
}
