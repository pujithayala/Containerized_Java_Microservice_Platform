import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { SERVICES_CONFIG, checkServiceHealth } from '../services/api';
import { ServiceHealth } from '../types';

export const MonitoringPage: React.FC = () => {
  const [healthData, setHealthData] = useState<ServiceHealth[]>([]);
  const [checking, setChecking] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<ServiceHealth | null>(null);

  const checkAllServices = async () => {
    setChecking(true);
    try {
      const results = await Promise.all(SERVICES_CONFIG.map(cfg => checkServiceHealth(cfg)));
      setHealthData(results);
      if (results.length > 0 && !selectedService) {
        setSelectedService(results[0]);
      }
    } finally {
      setChecking(false);
    }
  };

  const recheckSingle = async (serviceId: string) => {
    const cfg = SERVICES_CONFIG.find(s => s.id === serviceId);
    if (!cfg) return;

    setHealthData(prev => prev.map(s => s.id === serviceId ? { ...s, status: 'CHECKING' } : s));
    const result = await checkServiceHealth(cfg);
    setHealthData(prev => prev.map(s => s.id === serviceId ? result : s));
    if (selectedService?.id === serviceId) {
      setSelectedService(result);
    }
  };

  useEffect(() => {
    checkAllServices();
    const interval = setInterval(checkAllServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const upCount = healthData.filter(s => s.status === 'UP').length;

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Microservice Monitoring Center</h2>
          <p className="page-subtitle">Real-time health telemetry across the Spring Boot cluster</p>
        </div>
        <div className="toolbar">
          <button
            onClick={checkAllServices}
            disabled={checking}
            className="btn btn-primary btn-sm"
          >
            <RefreshCw size={14} className={checking ? 'spinner' : ''} />
            <span>Probe All Endpoints</span>
          </button>
        </div>
      </div>

      {/* Health Overview Strip */}
      <div className="grid-3" style={{ marginBottom: '28px' }}>
        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Registered Services</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{SERVICES_CONFIG.length} Microservices</div>
          <div style={{ fontSize: '12px', color: 'var(--accent-blue)', marginTop: '4px' }}>Autonomous Java 21 Containers</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Cluster Availability</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: upCount === SERVICES_CONFIG.length ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
            {Math.round((upCount / (SERVICES_CONFIG.length || 1)) * 100)}% Online
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{upCount} of {SERVICES_CONFIG.length} healthy</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Actuator Discovery</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-cyan)' }}>Enabled</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Endpoints exposed at /actuator/health</div>
        </div>
      </div>

      {/* Services Cards Grid */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Service Nodes</h3>
          {healthData.map((srv) => (
            <div
              key={srv.id}
              onClick={() => setSelectedService(srv)}
              className="card"
              style={{
                cursor: 'pointer',
                borderColor: selectedService?.id === srv.id ? 'var(--accent-blue)' : 'var(--border-color)',
                boxShadow: selectedService?.id === srv.id ? '0 0 16px rgba(59, 130, 246, 0.2)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`status-dot ${srv.status === 'UP' ? 'online' : srv.status === 'CHECKING' ? 'checking' : 'offline'}`}></span>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{srv.name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Port {srv.port} · v{srv.version}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {srv.status === 'UP' && (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {srv.latency}ms
                    </span>
                  )}
                  <span className={`badge ${srv.status === 'UP' ? 'badge-success' : srv.status === 'CHECKING' ? 'badge-warning' : 'badge-danger'}`}>
                    {srv.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      recheckSingle(srv.id);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px' }}
                    title="Probe service"
                  >
                    <RefreshCw size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Service Diagnostic Details */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Diagnostic Inspector</h3>
          {selectedService ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700 }}>{selectedService.name}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Target: {selectedService.url}</p>
                </div>
                <span className={`badge ${selectedService.status === 'UP' ? 'badge-success' : 'badge-danger'}`}>
                  {selectedService.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Service ID:</span>
                  <code style={{ color: 'var(--accent-blue)' }}>{selectedService.id}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Internal Container Port:</span>
                  <span style={{ fontWeight: 600 }}>{selectedService.port}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Response Latency:</span>
                  <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{selectedService.latency || 0} ms</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Last Ping Timestamp:</span>
                  <span>{selectedService.lastChecked || 'Just now'}</span>
                </div>
              </div>

              <div>
                <span className="label">Raw Actuator Payload</span>
                <pre className="code-block" style={{ maxHeight: '200px' }}>
                  {JSON.stringify(selectedService.components || { status: selectedService.status }, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="card empty-state">
              <Server size={32} />
              <p>Select any microservice node to inspect its live health check output.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

