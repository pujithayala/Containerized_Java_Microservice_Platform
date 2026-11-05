import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { UsersPage } from './pages/UsersPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { DockerPage } from './pages/DockerPage';
import { ApiDocsPage } from './pages/ApiDocsPage';

const AppLayout: React.FC = () => {
  const location = useLocation();

  const getPageMeta = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'Containerized Java Microservice Platform', subtitle: 'Distributed enterprise cloud architecture running with Java 21, Spring Boot 3, and Docker' };
      case '/dashboard':
        return { title: 'Cluster Overview & Analytics', subtitle: 'Live telemetry across all connected microservices and active database schemas' };
      case '/monitoring':
        return { title: 'Microservice Health Monitoring', subtitle: 'Continuous HTTP / Actuator diagnostics, latency probes, and node status' };
      case '/users':
        return { title: 'User Identity & Security Management', subtitle: 'Spring Security authentication, BCrypt password hashing, and user registry' };
      case '/products':
        return { title: 'Product Catalog Management', subtitle: 'PostgreSQL CRUD operations with transactional inventory allocation' };
      case '/orders':
        return { title: 'Order Fulfillment & Lifecycle', subtitle: 'Synchronous inter-service inventory verification and notification triggers' };
      case '/notifications':
        return { title: 'Notification & Event Center', subtitle: 'Persistent system alerts and order event broadcasting' };
      case '/docker':
        return { title: 'Docker Container Infrastructure', subtitle: 'Multi-container orchestration, volume persistence, and bridge networking' };
      case '/api-docs':
        return { title: 'REST API Developer Documentation', subtitle: 'Contract specifications for API Gateway reverse proxy endpoints' };
      default:
        return { title: 'Cloud Platform Console', subtitle: 'Containerized Java Microservice Platform' };
    }
  };

  const meta = getPageMeta();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        <Header title={meta.title} subtitle={meta.subtitle} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/docker" element={<DockerPage />} />
            <Route path="/api-docs" element={<ApiDocsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

