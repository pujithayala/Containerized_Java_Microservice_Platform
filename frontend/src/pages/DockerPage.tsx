import React from 'react';
import {
  Boxes,
  Server,
  Database,
  Layers,
  Terminal,
  Cpu,
  HardDrive,
  Network,
  CheckCircle2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const DockerPage: React.FC = () => {
  const containers = [
    {
      name: 'microservice-frontend',
      role: 'Web Application UI',
      image: 'microservice-platform-frontend:latest',
      ports: '3000:80',
      network: 'microservice-network',
      status: 'healthy',
      type: 'frontend',
    },
    {
      name: 'microservice-api-gateway',
      role: 'Spring Cloud Gateway',
      image: 'microservice-platform-api-gateway:latest',
      ports: '8080:8080',
      network: 'microservice-network',
      status: 'healthy',
      type: 'gateway',
    },
    {
      name: 'microservice-user-service',
      role: 'User Management & Auth',
      image: 'microservice-platform-user-service:latest',
      ports: '8081:8081',
      network: 'microservice-network',
      status: 'healthy',
      type: 'service',
      db: 'userdb',
    },
    {
      name: 'microservice-product-service',
      role: 'Product Catalog Engine',
      image: 'microservice-platform-product-service:latest',
      ports: '8082:8082',
      network: 'microservice-network',
      status: 'healthy',
      type: 'service',
      db: 'productdb',
    },
    {
      name: 'microservice-order-service',
      role: 'Order Processing Pipeline',
      image: 'microservice-platform-order-service:latest',
      ports: '8083:8083',
      network: 'microservice-network',
      status: 'healthy',
      type: 'service',
      db: 'orderdb',
    },
    {
      name: 'microservice-notification-service',
      role: 'Notification Event Hub',
      image: 'microservice-platform-notification-service:latest',
      ports: '8085:8085',
      network: 'microservice-network',
      status: 'healthy',
      type: 'service',
      db: 'notificationdb',
    },
    {
      name: 'microservice-postgres',
      role: 'Multi-Tenant Database Engine',
      image: 'postgres:16-alpine',
      ports: '5432:5432',
      network: 'microservice-network',
      status: 'healthy',
      type: 'database',
      volume: 'postgres_data:/var/lib/postgresql/data',
    },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Docker Orchestration Dashboard</h2>
          <p className="page-subtitle">Container topology, bridge networking, and persistent storage volumes</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontSize: '13px' }}>
          <CheckCircle2 size={16} />
          <span>7 Active Docker Containers</span>
        </div>
      </div>

      {/* Network & Volume Summary Strip */}
      <div className="grid-3" style={{ marginBottom: '28px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Network size={18} color="var(--accent-blue)" />
            <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Bridge Network</h4>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>microservice-network</div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Internal DNS resolution by container service name
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <HardDrive size={18} color="var(--accent-green)" />
            <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Persistent Volume</h4>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>postgres_data</div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Mounted to /var/lib/postgresql/data for zero data loss
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Cpu size={18} color="var(--accent-cyan)" />
            <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Container Health Checks</h4>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-cyan)' }}>INTERVAL: 10s</div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Depends_on condition: service_healthy startup flow
          </p>
        </div>
      </div>

      {/* Containers List */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Container Topology</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {containers.map((c) => (
            <div key={c.name} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  background: c.type === 'database' ? 'rgba(16, 185, 129, 0.15)' : c.type === 'frontend' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {c.type === 'database' ? <Database size={20} color="var(--accent-green)" /> :
                   c.type === 'frontend' ? <Layers size={20} color="var(--accent-cyan)" /> :
                   <Server size={20} color="var(--accent-blue)" />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>{c.name}</h4>
                    <span className="badge badge-success">HEALTHY</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {c.role} · Image: <code style={{ color: 'var(--accent-blue)' }}>{c.image}</code>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Host Port Mapping</div>
                  <code style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-cyan)' }}>{c.ports}</code>
                </div>

                {c.db && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Attached Database</div>
                    <span className="badge badge-purple">{c.db}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Docker Compose CLI Commands */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={16} color="var(--accent-cyan)" />
          <span>Docker Compose CLI Lifecycle</span>
        </h3>
        <pre className="code-block">
{`# 1. Build and start all 7 containers in detached mode:
docker compose up --build -d

# 2. Inspect container runtime logs in real time:
docker compose logs -f

# 3. View service status and health check state:
docker compose ps

# 4. Stop and cleanly destroy the cluster (preserving PostgreSQL persistent volumes):
docker compose down`}
        </pre>
      </div>
    </div>
  );
};

