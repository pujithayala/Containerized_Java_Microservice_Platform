import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Search,
  X
} from 'lucide-react';
import { userApi } from '../services/api';
import { User, UserRegistrationRequest } from '../types';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [form, setForm] = useState<UserRegistrationRequest>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to connect to User Service via API Gateway.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await userApi.register(form);
      setSuccessMsg(`User ${form.username} registered successfully!`);
      setIsModalOpen(false);
      setForm({ username: '', email: '', password: '', firstName: '', lastName: '' });
      loadUsers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Check parameters.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) return;
    try {
      await userApi.delete(id);
      setSuccessMsg(`User ${username} deleted.`);
      loadUsers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete user.');
    }
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">User Management</h2>
          <p className="page-subtitle">User authentication, BCrypt hashing, and role-based directory</p>
        </div>
        <div className="toolbar">
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
            <UserPlus size={15} />
            <span>Register New User</span>
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

      {/* Filter / Search Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input
            type="text"
            className="input"
            placeholder="Search users by username, email, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
            Showing {filteredUsers.length} of {users.length} registered users
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Fetching users from User Service via API Gateway...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <Users size={32} />
            <p>No users found matching your query.</p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
              Register A User
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td><code>#{user.id}</code></td>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{user.username}</td>
                    <td>{user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '—'}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'ADMIN' ? 'badge-purple' : 'badge-blue'}`}>
                        {user.role || 'USER'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(user.id, user.username)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 8px' }}
                        title="Delete User"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register User Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Register New User</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="label">Username *</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. dev_architect"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  required
                  className="input"
                  placeholder="e.g. user@platform.cloud"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="label">Password (BCrypt Hashed) *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="John"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Registering...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

