import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Package,
  User,
  ArrowRight,
  RefreshCw,
  Ban
} from 'lucide-react';
import { orderApi, productApi, userApi } from '../services/api';
import { Order, Product, User as UserType, CreateOrderRequest } from '../types';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form state
  const [selectedUserId, setSelectedUserId] = useState<number>(1);
  const [shippingAddress, setShippingAddress] = useState<string>('Cloud DC 1, Rack A4, US-East');
  const [orderItems, setOrderItems] = useState<{ productId: number; quantity: number }[]>([
    { productId: 1, quantity: 1 }
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ordersData, prodsData, usersData] = await Promise.all([
        orderApi.getAll(),
        productApi.getAll(),
        userApi.getAll()
      ]);
      setOrders(ordersData);
      setProducts(prodsData);
      setUsers(usersData);
      if (usersData.length > 0 && !selectedUserId) {
        setSelectedUserId(usersData[0].id);
      }
      if (prodsData.length > 0 && orderItems[0]?.productId === 1 && !prodsData.find(p => p.id === 1)) {
        setOrderItems([{ productId: prodsData[0].id, quantity: 1 }]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load order processing records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItem = () => {
    const firstProdId = products[0]?.id || 1;
    setOrderItems([...orderItems, { productId: firstProdId, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: number) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  const calculatedTotal = orderItems.reduce((acc, item) => {
    const product = products.find(p => p.id === item.productId);
    return acc + (product ? product.price * item.quantity : 0);
  }, 0);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      setError('Please add at least one product item to place an order.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateOrderRequest = {
        userId: selectedUserId,
        shippingAddress,
        items: orderItems,
      };
      const created = await orderApi.create(payload);
      setSuccessMsg(`Order ${created.orderNumber} placed successfully!`);
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Order creation failed. Check product stock or user ID.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvanceStatus = async (order: Order) => {
    const statusFlow = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusFlow.indexOf(order.status);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return;

    const nextStatus = statusFlow[currentIndex + 1];
    try {
      await orderApi.updateStatus(order.id, nextStatus);
      setSuccessMsg(`Order ${order.orderNumber} advanced to ${nextStatus}.`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update order status.');
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (!window.confirm(`Cancel order ${order.orderNumber}?`)) return;
    try {
      await orderApi.cancel(order.id);
      setSuccessMsg(`Order ${order.orderNumber} cancelled.`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to cancel order.');
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Order Processing Service</h2>
          <p className="page-subtitle">Inter-service transaction workflow, inventory checks, and status tracking</p>
        </div>
        <div className="toolbar">
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px',
          background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px', color: 'var(--accent-green)', fontSize: '13px', marginBottom: '16px'
        }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading orders from Order Service...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={36} />
            <p>No orders registered in the system yet.</p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
              Place Initial Order
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer</th>
                  <th>Destination</th>
                  <th>Item Details</th>
                  <th>Total Amount</th>
                  <th>Order Status</th>
                  <th style={{ textAlign: 'right' }}>Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{order.orderNumber}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>User #{order.userId}</div>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                      {order.shippingAddress}
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ color: 'var(--text-primary)' }}>
                            • {item.productName || `Product #${item.productId}`} × {item.quantity} (${(item.subtotal || item.price * item.quantity).toFixed(2)})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '15px' }}>
                      ${order.totalAmount?.toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge ${
                        order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'badge-success' :
                        order.status === 'CANCELLED' ? 'badge-danger' :
                        order.status === 'PROCESSING' || order.status === 'SHIPPED' ? 'badge-info' :
                        'badge-warning'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="actions" style={{ justifyContent: 'flex-end' }}>
                        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleAdvanceStatus(order)}
                            className="btn btn-secondary btn-sm"
                            title="Advance to next status"
                          >
                            <span>Advance</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="btn btn-danger btn-sm"
                            title="Cancel Order"
                          >
                            <Ban size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Order */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Place Microservice Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder}>
              <div className="form-group">
                <label className="label">Select Customer Account *</label>
                <select
                  className="select"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
                >
                  {users.length > 0 ? (
                    users.map(u => (
                      <option key={u.id} value={u.id}>
                        User #{u.id} - {u.username} ({u.email})
                      </option>
                    ))
                  ) : (
                    <option value={1}>User #1 (Default Tenant)</option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Delivery Target / Region *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="label" style={{ margin: 0 }}>Order Line Items</label>
                  <button type="button" onClick={handleAddItem} className="btn btn-secondary btn-sm">
                    + Add Product Item
                  </button>
                </div>

                {orderItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                    <select
                      className="select"
                      style={{ flex: 2 }}
                      value={item.productId}
                      onChange={(e) => handleItemChange(idx, 'productId', parseInt(e.target.value))}
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${p.price.toFixed(2)}) - Stock: {p.stockQuantity}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min={1}
                      className="input"
                      style={{ width: '80px' }}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                    />

                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="btn btn-danger btn-sm"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{
                padding: '14px',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Calculated Total:</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-green)' }}>
                  ${calculatedTotal.toFixed(2)} USD
                </span>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Submitting Order...' : 'Confirm Order Placement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

