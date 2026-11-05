import React, { useState } from 'react';
import { Code2, Terminal, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';

export const ApiDocsPage: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const endpoints = [
    {
      service: 'User Service (via Gateway)',
      items: [
        {
          id: 'user-reg',
          method: 'POST',
          path: '/api/users/register',
          desc: 'Registers a new user account with BCrypt encrypted credentials.',
          req: JSON.stringify({
            username: "cloud_developer",
            email: "dev@cloud.io",
            password: "strongPassword123",
            firstName: "Alex",
            lastName: "Mercer"
          }, null, 2),
          res: JSON.stringify({
            id: 1,
            username: "cloud_developer",
            email: "dev@cloud.io",
            firstName: "Alex",
            lastName: "Mercer",
            role: "USER",
            createdAt: "2026-11-05T10:00:00Z"
          }, null, 2)
        },
        {
          id: 'user-list',
          method: 'GET',
          path: '/api/users',
          desc: 'Retrieves all registered user profiles.',
          req: null,
          res: JSON.stringify([
            { id: 1, username: "admin", email: "admin@platform.cloud", role: "ADMIN" }
          ], null, 2)
        }
      ]
    },
    {
      service: 'Product Service (via Gateway)',
      items: [
        {
          id: 'prod-list',
          method: 'GET',
          path: '/api/products?category=Containers&search=redis',
          desc: 'Fetches products with optional category and search query parameters.',
          req: null,
          res: JSON.stringify([
            {
              id: 101,
              name: "Redis Enterprise Cache",
              category: "Containers",
              price: 39.99,
              stockQuantity: 15
            }
          ], null, 2)
        },
        {
          id: 'prod-create',
          method: 'POST',
          path: '/api/products',
          desc: 'Creates a new product item in PostgreSQL catalog.',
          req: JSON.stringify({
            name: "PostgreSQL HA Cluster",
            description: "High availability managed database",
            price: 129.99,
            stockQuantity: 20,
            category: "Cloud Services"
          }, null, 2),
          res: JSON.stringify({
            id: 102,
            name: "PostgreSQL HA Cluster",
            price: 129.99,
            stockQuantity: 20,
            createdAt: "2026-11-05T10:15:00Z"
          }, null, 2)
        }
      ]
    },
    {
      service: 'Order Service (via Gateway)',
      items: [
        {
          id: 'order-create',
          method: 'POST',
          path: '/api/orders',
          desc: 'Submits a new order, validates stock with Product Service, and emits a notification.',
          req: JSON.stringify({
            userId: 1,
            shippingAddress: "Cloud Region us-east-1",
            items: [
              { productId: 101, quantity: 2 }
            ]
          }, null, 2),
          res: JSON.stringify({
            id: 501,
            orderNumber: "ORD-94812",
            userId: 1,
            totalAmount: 79.98,
            status: "PENDING",
            items: [
              { productId: 101, productName: "Redis Enterprise Cache", quantity: 2, subtotal: 79.98 }
            ]
          }, null, 2)
        },
        {
          id: 'order-status',
          method: 'PUT',
          path: '/api/orders/501/status',
          desc: 'Advances the order status through the order fulfillment lifecycle.',
          req: JSON.stringify({ status: "PROCESSING" }, null, 2),
          res: JSON.stringify({
            id: 501,
            orderNumber: "ORD-94812",
            status: "PROCESSING"
          }, null, 2)
        }
      ]
    },
    {
      service: 'Notification Service (via Gateway)',
      items: [
        {
          id: 'notif-list',
          method: 'GET',
          path: '/api/notifications',
          desc: 'Returns the system event feed and order notification stream.',
          req: null,
          res: JSON.stringify([
            {
              id: 1,
              userId: 1,
              orderId: 501,
              type: "ORDER_CREATED",
              title: "Order Placed",
              message: "Order ORD-94812 successfully placed",
              read: false
            }
          ], null, 2)
        }
      ]
    }
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">REST API Specifications</h2>
          <p className="page-subtitle">Interactive schema contracts for API Gateway reverse proxy endpoints</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontSize: '13px' }}>
          <ShieldCheck size={16} />
          <span>Base Gateway Ingress: <code>http://localhost:8080</code></span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {endpoints.map((group, gIdx) => (
          <div key={gIdx} className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={18} color="var(--accent-blue)" />
              {group.service}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {group.items.map((ep) => (
                <div
                  key={ep.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    padding: '16px 20px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`badge ${
                        ep.method === 'GET' ? 'badge-get' :
                        ep.method === 'POST' ? 'badge-post' :
                        ep.method === 'PUT' ? 'badge-put' :
                        'badge-delete'
                      }`}>
                        {ep.method}
                      </span>
                      <code style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>{ep.path}</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`curl -X ${ep.method} http://localhost:8080${ep.path}`, ep.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      {copiedId === ep.id ? <Check size={13} color="var(--accent-green)" /> : <Copy size={13} />}
                      <span>{copiedId === ep.id ? 'Copied cURL' : 'cURL'}</span>
                    </button>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    {ep.desc}
                  </p>

                  <div className="grid-2">
                    {ep.req && (
                      <div>
                        <span className="label">Request Body (JSON)</span>
                        <pre className="code-block">{ep.req}</pre>
                      </div>
                    )}
                    <div style={{ gridColumn: ep.req ? 'auto' : '1 / -1' }}>
                      <span className="label">Response Payload (HTTP 200/201)</span>
                      <pre className="code-block">{ep.res}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

