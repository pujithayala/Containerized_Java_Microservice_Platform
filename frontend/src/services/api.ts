import axios from 'axios';
import {
  User,
  UserRegistrationRequest,
  Product,
  ProductRequest,
  Order,
  CreateOrderRequest,
  Notification,
  ServiceHealth
} from '../types';

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return '';
  }
  return (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080';
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Users API
export const userApi = {
  getAll: async (): Promise<User[]> => {
    const res = await apiClient.get<User[]>('/api/users');
    return res.data;
  },
  getById: async (id: number): Promise<User> => {
    const res = await apiClient.get<User>(`/api/users/${id}`);
    return res.data;
  },
  register: async (data: UserRegistrationRequest): Promise<User> => {
    const res = await apiClient.post<User>('/api/users/register', data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/users/${id}`);
  },
  getCount: async (): Promise<number> => {
    try {
      const res = await apiClient.get<{ count: number }>('/api/users/count');
      return res.data.count;
    } catch {
      const all = await userApi.getAll();
      return all.length;
    }
  }
};

// Products API
export const productApi = {
  getAll: async (category?: string, search?: string): Promise<Product[]> => {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (search) params.search = search;
    const res = await apiClient.get<Product[]>('/api/products', { params });
    return res.data;
  },
  getById: async (id: number): Promise<Product> => {
    const res = await apiClient.get<Product>(`/api/products/${id}`);
    return res.data;
  },
  create: async (data: ProductRequest): Promise<Product> => {
    const res = await apiClient.post<Product>('/api/products', data);
    return res.data;
  },
  update: async (id: number, data: ProductRequest): Promise<Product> => {
    const res = await apiClient.put<Product>(`/api/products/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/products/${id}`);
  },
  getCount: async (): Promise<number> => {
    try {
      const res = await apiClient.get<{ count: number }>('/api/products/count');
      return res.data.count;
    } catch {
      const all = await productApi.getAll();
      return all.length;
    }
  }
};

// Orders API
export const orderApi = {
  getAll: async (): Promise<Order[]> => {
    const res = await apiClient.get<Order[]>('/api/orders');
    return res.data;
  },
  getById: async (id: number): Promise<Order> => {
    const res = await apiClient.get<Order>(`/api/orders/${id}`);
    return res.data;
  },
  getByUser: async (userId: number): Promise<Order[]> => {
    const res = await apiClient.get<Order[]>(`/api/orders/user/${userId}`);
    return res.data;
  },
  create: async (data: CreateOrderRequest): Promise<Order> => {
    const res = await apiClient.post<Order>('/api/orders', data);
    return res.data;
  },
  updateStatus: async (id: number, status: string): Promise<Order> => {
    const res = await apiClient.put<Order>(`/api/orders/${id}/status`, { status });
    return res.data;
  },
  cancel: async (id: number): Promise<Order> => {
    const res = await apiClient.delete<Order>(`/api/orders/${id}`);
    return res.data;
  },
  getCount: async (): Promise<number> => {
    try {
      const res = await apiClient.get<{ count: number }>('/api/orders/count');
      return res.data.count;
    } catch {
      const all = await orderApi.getAll();
      return all.length;
    }
  }
};

// Notifications API
export const notificationApi = {
  getAll: async (): Promise<Notification[]> => {
    const res = await apiClient.get<Notification[]>('/api/notifications');
    return res.data;
  },
  getByUser: async (userId: number): Promise<Notification[]> => {
    const res = await apiClient.get<Notification[]>(`/api/notifications/user/${userId}`);
    return res.data;
  },
  markRead: async (id: number): Promise<Notification> => {
    const res = await apiClient.put<Notification>(`/api/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async (userId: number): Promise<Notification[]> => {
    const res = await apiClient.put<Notification[]>(`/api/notifications/user/${userId}/read-all`);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/notifications/${id}`);
  },
  getUnreadCount: async (): Promise<number> => {
    try {
      const res = await apiClient.get<{ count: number }>('/api/notifications/unread/count');
      return res.data.count;
    } catch {
      const all = await notificationApi.getAll();
      return all.filter(n => !n.read).length;
    }
  }
};

// Microservice Definitions for Monitoring
export const SERVICES_CONFIG = [
  { name: 'API Gateway', id: 'api-gateway', port: 8080, healthUrl: 'http://localhost:8080/health', version: '1.0.0' },
  { name: 'User Service', id: 'user-service', port: 8081, healthUrl: 'http://localhost:8081/actuator/health', version: '1.0.0' },
  { name: 'Product Service', id: 'product-service', port: 8082, healthUrl: 'http://localhost:8082/actuator/health', version: '1.0.0' },
  { name: 'Order Service', id: 'order-service', port: 8083, healthUrl: 'http://localhost:8083/actuator/health', version: '1.0.0' },
  { name: 'Notification Service', id: 'notification-service', port: 8085, healthUrl: 'http://localhost:8085/actuator/health', version: '1.0.0' },
];

export const checkServiceHealth = async (cfg: typeof SERVICES_CONFIG[0]): Promise<ServiceHealth> => {
  const start = performance.now();
  try {
    const res = await axios.get(cfg.healthUrl, { timeout: 3500 });
    const latency = Math.round(performance.now() - start);
    return {
      name: cfg.name,
      id: cfg.id,
      port: cfg.port,
      status: res.status === 200 ? 'UP' : 'DOWN',
      url: cfg.healthUrl,
      latency,
      version: cfg.version,
      components: res.data?.components || res.data,
      lastChecked: new Date().toLocaleTimeString(),
    };
  } catch {
    return {
      name: cfg.name,
      id: cfg.id,
      port: cfg.port,
      status: 'DOWN',
      url: cfg.healthUrl,
      latency: 0,
      version: cfg.version,
      lastChecked: new Date().toLocaleTimeString(),
    };
  }
};
