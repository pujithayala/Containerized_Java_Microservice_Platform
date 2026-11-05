import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  X,
  DollarSign
} from 'lucide-react';
import { productApi } from '../services/api';
import { Product, ProductRequest } from '../types';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [form, setForm] = useState<ProductRequest>({
    name: '',
    description: '',
    price: 0,
    stockQuantity: 10,
    category: 'Cloud Services',
    imageUrl: '',
  });

  const categories = ['All', 'Cloud Services', 'Containers', 'Storage', 'Networking', 'Developer Tools'];

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoryParam = selectedCategory && selectedCategory !== 'All' ? selectedCategory : undefined;
      const data = await productApi.getAll(categoryParam, search || undefined);
      setProducts(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load products from Product Service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      price: 49.99,
      stockQuantity: 50,
      category: 'Cloud Services',
      imageUrl: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      stockQuantity: p.stockQuantity,
      category: p.category || 'Cloud Services',
      imageUrl: p.imageUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await productApi.update(editingId, form);
        setSuccessMsg(`Product #${editingId} updated successfully.`);
      } else {
        await productApi.create(form);
        setSuccessMsg(`New product created successfully.`);
      }
      setIsModalOpen(false);
      loadProducts();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Operation failed. Verify request values.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete product "${name}" (ID #${id})?`)) return;
    try {
      await productApi.delete(id);
      setSuccessMsg(`Product #${id} removed.`);
      loadProducts();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete product.');
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Product Catalog Management</h2>
          <p className="page-subtitle">PostgreSQL-backed catalog with real-time stock and pricing CRUD</p>
        </div>
        <div className="toolbar">
          <button onClick={openCreateModal} className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>Add New Product</span>
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

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 300px' }}>
            <Search size={18} color="var(--text-secondary)" />
            <input
              type="text"
              className="input"
              placeholder="Search products by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={18} color="var(--text-secondary)" />
            <select
              className="select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '180px' }}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-secondary btn-sm">
            Filter
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Querying product catalog from PostgreSQL database...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Package size={36} />
            <p>No products found in the catalog.</p>
            <button onClick={openCreateModal} className="btn btn-primary btn-sm">
              Create First Product
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Stock Inventory</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td><code>#{p.id}</code></td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.description}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-purple">{p.category || 'General'}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-green)' }}>
                      ${p.price.toFixed(2)}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{p.stockQuantity}</span>
                    </td>
                    <td>
                      <span className={`badge ${p.stockQuantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {p.stockQuantity > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEditModal(p)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Edit Product"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Delete Product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create or Edit Product */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Product' : 'Create Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Product Name *</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. Managed Kubernetes Cluster"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="label">Category *</label>
                <select
                  className="select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="Cloud Services">Cloud Services</option>
                  <option value="Containers">Containers</option>
                  <option value="Storage">Storage</option>
                  <option value="Networking">Networking</option>
                  <option value="Developer Tools">Developer Tools</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Price ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="input"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="input"
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Provide technical specifications and feature overview..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

