import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Clock,
  Filter,
  CheckCheck,
  Info,
  Package
} from 'lucide-react';
import { notificationApi } from '../services/api';
import { Notification } from '../types';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationApi.getAll();
      setNotifications(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load event alerts from Notification Service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update notification state.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationApi.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete notification.');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Notification Hub</h2>
          <p className="page-subtitle">Real-time asynchronous order & system events recorded across microservices</p>
        </div>
        <div className="toolbar">
          <button onClick={loadNotifications} className="btn btn-secondary btn-sm">
            Refresh Stream
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Metrics Header */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Events ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`btn btn-sm ${filter === 'read' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Archived ({notifications.length - unreadCount})
          </button>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {unreadCount > 0 ? (
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>● {unreadCount} new alerts pending review</span>
          ) : (
            <span>All event messages acknowledged</span>
          )}
        </div>
      </div>

      {/* Notifications Feed */}
      <div className="card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Querying notification events from notification-service...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={36} />
            <p>No notifications in this filter category.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '16px 20px',
                  borderRadius: '10px',
                  background: notif.read ? 'rgba(13, 21, 41, 0.4)' : 'rgba(59, 130, 246, 0.08)',
                  border: notif.read ? '1px solid var(--border-color)' : '1px solid rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.2s ease',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: notif.type === 'ORDER_CREATED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {notif.type === 'ORDER_CREATED' ? (
                      <Package size={18} color="var(--accent-green)" />
                    ) : (
                      <Info size={18} color="var(--accent-blue)" />
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: notif.read ? 'var(--text-secondary)' : '#f8fafc' }}>
                        {notif.title}
                      </h4>
                      <span className="badge badge-blue">{notif.type}</span>
                      {!notif.read && (
                        <span className="badge badge-info">NEW</span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.5 }}>
                      {notif.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <span>User ID #{notif.userId}</span>
                      {notif.orderId && <span>Order Ref #{notif.orderId}</span>}
                      <span>{notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Just now'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="btn btn-secondary btn-sm"
                      title="Mark as Read"
                    >
                      <CheckCheck size={14} />
                      <span>Read</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="btn btn-danger btn-sm"
                    title="Delete Notification"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

