export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl?: string;
}

export interface OrderItem {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | string;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  userId: number;
  items: {
    productId: number;
    quantity: number;
  }[];
  shippingAddress: string;
}

export interface Notification {
  id: number;
  userId: number;
  orderId?: number;
  type: 'ORDER_CREATED' | 'ORDER_STATUS_UPDATED' | 'SYSTEM_ALERT' | 'USER_WELCOME';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ServiceHealth {
  name: string;
  id: string;
  port: number;
  status: 'UP' | 'DOWN' | 'CHECKING';
  url: string;
  latency?: number;
  version: string;
  components?: Record<string, any>;
  lastChecked?: string;
}

export interface DockerContainerInfo {
  name: string;
  image: string;
  service: string;
  status: 'running' | 'exited' | 'healthy' | 'starting';
  ports: string;
  internalPort: number;
  database?: string;
}

