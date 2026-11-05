import React from 'react';
import { Link } from 'react-router-dom';
import {
  Server,
  Layers,
  Database,
  Shield,
  ArrowRight,
  Boxes,
  Zap,
  Activity,
  CheckCircle2,
  Terminal,
  Cpu
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const services = [
    {
      name: 'API Gateway',
      port: 8080,
      tech: 'Spring Cloud Gateway / WebFlux',
      desc: 'Central point of ingress for all incoming client traffic. Handles request logging, reactive rate limiting, and reverse proxy routing to downstream microservices.',
      color: 'var(--accent-blue)',
    },
    {
      name: 'User Service',
      port: 8081,
      tech: 'Spring Boot 3 / Spring Security / JPA',
      desc: 'Handles user authentication, BCrypt password hashing, registration, role-based security, profile retrieval, and PostgreSQL user data persistence.',
      color: 'var(--accent-purple)',
    },
    {
      name: 'Product Service',
      port: 8082,
      tech: 'Spring Data JPA / PostgreSQL',
      desc: 'Complete product catalog engine managing inventory quantities, unit pricing, real-time search, category filtering, and transactional stock updates.',
      color: 'var(--accent-green)',
    },
    {
      name: 'Order Service',
      port: 8083,
      tech: 'Spring Boot 3 / RestTemplate / JPA',
      desc: 'Coordinates order lifecycle (PENDING to COMPLETED), performs synchronous validation with Product Service, and emits lifecycle notifications.',
      color: 'var(--accent-orange)',
    },
    {
      name: 'Notification Service',
      port: 8085,
      tech: 'Spring Boot 3 / JPA / PostgreSQL',
      desc: 'Event and alert management service that stores system notifications, user alerts, order creation confirmations, and unread badge counters.',
      color: 'var(--accent-cyan)',
    },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Hero Banner */}
      <div className="card glow-blue" style={{
        padding: '48px 40px',
        marginBottom: '36px',
        background: 'linear-gradient(135deg, rgba(13, 21, 41, 0.95), rgba(17, 24, 39, 0.98))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '780px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '20px',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: 'var(--accent-cyan)',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '16px'
          }}>
            <Cpu size={14} /> Production-Grade Distributed Architecture
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>
            Containerized <span className="gradient-text">Java Microservice</span> Platform
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.7 }}>
            A fully decoupled microservice platform engineered with <strong>Java 21</strong>, <strong>Spring Boot 3</strong>,
            <strong> Spring Security</strong>, <strong>PostgreSQL</strong>, and <strong>React + TypeScript</strong>.
            Demonstrating service mesh routing, inter-service HTTP communication, persistent multi-database storage, and Docker container orchestration.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }}>
              <span>Open Metrics Dashboard</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/monitoring" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '14px' }}>
              <Activity size={16} />
              <span>Service Health Center</span>
            </Link>
            <Link to="/docker" className="btn btn-cyan" style={{ padding: '12px 24px', fontSize: '14px' }}>
              <Boxes size={16} />
              <span>Docker Architecture</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="grid-3" style={{ marginBottom: '36px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap color="var(--accent-blue)" size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Single Entry Gateway</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Port 8080 Reverse Proxy</p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            All frontend interactions route through Spring Cloud Gateway with unified CORS policies, request correlation IDs, and rate limit validation.
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Database color="var(--accent-green)" size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Database Per Service</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Isolated PostgreSQL DBs</p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Microservices adhere strictly to the database-per-service pattern with dedicated schemas: <code style={{ color: 'var(--accent-green)' }}>userdb</code>, <code style={{ color: 'var(--accent-green)' }}>productdb</code>, <code style={{ color: 'var(--accent-green)' }}>orderdb</code>, and <code style={{ color: 'var(--accent-green)' }}>notificationdb</code>.
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Boxes color="var(--accent-orange)" size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Docker Compose Mesh</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Multi-Container Runtime</p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Containerized with multi-stage Dockerfiles for minimal image footprint. Health checks, volume mounts, and bridge networking configure automatic startup ordering.
          </p>
        </div>
      </div>

      {/* Services List Section */}
      <div style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
          Deconstructed Microservice Components
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {services.map((srv) => (
            <div key={srv.name} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: '1 1 500px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{srv.name}</h3>
                  <span className="badge badge-info">Port {srv.port}</span>
                  <span className="badge badge-blue">{srv.tech}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {srv.desc}
                </p>
              </div>
              <div>
                <Link to="/monitoring" className="btn btn-secondary btn-sm">
                  View Health Check
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

