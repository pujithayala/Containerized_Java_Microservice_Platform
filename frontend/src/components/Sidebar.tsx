import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Users,
  Package,
  ShoppingCart,
  Bell,
  Code2,
  Boxes,
  Home,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const navItems = [
    { to: '/', label: 'Architecture Overview', icon: Home, exact: true },
    { to: '/dashboard', label: 'Platform Metrics', icon: LayoutDashboard },
    { to: '/monitoring', label: 'Service Monitoring', icon: Server },
    { to: '/users', label: 'User Directory', icon: Users },
    { to: '/products', label: 'Product Catalog', icon: Package },
    { to: '/orders', label: 'Order Processing', icon: ShoppingCart },
    { to: '/notifications', label: 'Notification Hub', icon: Bell },
    { to: '/docker', label: 'Docker Containers', icon: Boxes },
    { to: '/api-docs', label: 'API Documentation', icon: Code2 },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)'
        }}>
          <Server size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '15px', color: '#f8fafc', letterSpacing: '-0.3px' }}>
            CloudPlatform
          </div>
          <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Java Microservices
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          padding: '8px 12px',
          marginBottom: '4px'
        }}>
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-blue)' : '3px solid transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px',
                marginBottom: '4px',
                transition: 'all 0.15s ease',
                textDecoration: 'none',
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Architecture Footer Status */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'rgba(10, 15, 30, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="status-dot online"></span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9' }}>Cluster: Healthy</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          5 Services · Docker Compose
        </div>
      </div>
    </aside>
  );
};

