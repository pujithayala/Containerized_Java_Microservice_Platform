import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingCart,
  Server,
  Activity,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import { userApi, productApi, orderApi, notificationApi, SERVICES_CONFIG, checkServiceHealth } from '../services/api';
import { Order, ServiceHealth } from '../types';

export const DashboardPage: React.FC = () => {
  const [userCount, setUserCount] = useState<number>(0);
  const [productCount, setProductCount] = useState<number>(0);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [servicesHealth, setServicesHealth] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [uCount, pCount, oCount, orders] = await Promise.allSettled([
        userApi.getCount(),
        productApi.getCount(),
        orderApi.getCount(),
        orderApi.getAll(),
      ]);

      if (uCount.status === 'fulfilled') setUserCount(uCount.value);
      if (pCount.status === 'fulfilled') setProductCount(pCount.value);
      if (oCount.status === 'fulfilled') setOrderCount(oCount.value);
      if (orders.status === 'fulfilled') {
        setRecentOrders(orders.value.slice(0, 5));
      }

      // Check health
      const healthPromises = SERVICES_CONFIG.map(cfg => checkServiceHealth(cfg));
      const healthResults = await Promise.all(healthPromises);
      setServicesHealth(healthResults);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onlineServicesCount = servicesHealth.filter(s => s.status === 'UP').length;

  const mockChartData = [
    { time: '06:00', requests: 120, orders: 4 },
    { time: '09:00', requests: 450, orders: 12 },
    { time: '12:00', requests: 780, orders: 28 },
    { time: '15:00', requests: 620, orders: 20 },
    { time: '18:00', requests: 940, orders: 35 },
    { time: '21:00', requests: 510, orders: 15 },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Platform Dashboard</h2>
          <p className="page-subtitle">Real-time telemetry and microservice cluster health</p>
        </div>
        <button onClick={fetchDashboardData} className="btn btn-secondary btn-sm">
          Refresh Metrics
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Users</span>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Users size={18} color="var(--accent-blue)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>
            {loading ? '...' : userCount}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-green)', marginTop: '6px' }}>
            <TrendingUp size={14} />
            <span>PostgreSQL User Service</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Catalog Products</span>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Package size={18} color="var(--accent-green)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>
            {loading ? '...' : productCount}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-green)', marginTop: '6px' }}>
            <TrendingUp size={14} />
            <span>Product Catalog Service</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Processed Orders</span>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShoppingCart size={18} color="var(--accent-orange)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>
            {loading ? '...' : orderCount}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-cyan)', marginTop: '6px' }}>
            <Activity size={14} />
            <span>Order Processing Engine</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Services</span>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Server size={18} color="var(--accent-cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>
            {onlineServicesCount} / {SERVICES_CONFIG.length}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: onlineServicesCount === SERVICES_CONFIG.length ? 'var(--accent-green)' : 'var(--accent-orange)', marginTop: '6px' }}>
            <span className={`status-dot ${onlineServicesCount === SERVICES_CONFIG.length ? 'online' : 'checking'}`}></span>
            <span>{onlineServicesCount === SERVICES_CONFIG.length ? 'All Systems Operational' : 'Cluster Initializing'}</span>
          </div>
        </div>
      </div>

      {/* Cluster Health & Traffic Charts */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Gateway Request Traffic</h3>
            <span className="badge badge-info">24h History</span>
          </div>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1529', borderColor: '#1e293b', borderRadius: '8px', color: '#f1f5f9' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#reqGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Microservice Health Grid</h3>
            <Link to="/monitoring" className="badge badge-blue">View All</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {servicesHealth.map((s) => (
              <div key={s.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`status-dot ${s.status === 'UP' ? 'online' : 'offline'}`}></span>
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>{s.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Port {s.port}</span>
                  <span className={`badge ${s.status === 'UP' ? 'badge-success' : 'badge-danger'}`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Recent Orders</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Live updates from order-service</p>
          </div>
          <Link to="/orders" className="btn btn-secondary btn-sm">
            <span>Manage Orders</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={32} />
            <p>No orders recorded yet. Create an order from the Order Processing page.</p>
            <Link to="/orders" className="btn btn-primary btn-sm">Create First Order</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>User ID</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{ord.orderNumber}</td>
                    <td>User #{ord.userId}</td>
                    <td>{ord.items?.length || 0} item(s)</td>
                    <td style={{ fontWeight: 700 }}>${ord.totalAmount?.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${
                        ord.status === 'COMPLETED' || ord.status === 'DELIVERED' ? 'badge-success' :
                        ord.status === 'CANCELLED' ? 'badge-danger' :
                        'badge-warning'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString() : 'Just now'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

