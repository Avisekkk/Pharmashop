import { useState, useEffect } from 'react'
import {
  PackageCheck, CheckCircle, Clock, Search, Filter, Eye, X
} from 'lucide-react'

export default function OrderDispensing() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('approved')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    const rxOrders = JSON.parse(localStorage.getItem('pharmashop_prescriptions') || '[]')
    const cartOrders = JSON.parse(localStorage.getItem('pharmashop_orders') || '[]')

    const normalized = [
      ...rxOrders.map((o) => ({ ...o, source: 'prescription' })),
      ...cartOrders.map((o) => ({ ...o, source: 'cart' })),
    ]
    normalized.sort((a, b) => b.id - a.id)
    setOrders(normalized)
  }, [])

  const saveOrders = (updated) => {
    setOrders(updated)
    const rxOrders = updated.filter((o) => o.source === 'prescription')
    const cartOrders = updated.filter((o) => o.source === 'cart')
    localStorage.setItem('pharmashop_prescriptions', JSON.stringify(rxOrders))
    localStorage.setItem('pharmashop_orders', JSON.stringify(cartOrders))
  }

  const filtered = orders.filter((o) => {
    const matchFilter = filter === 'all' || o.status === filter
    const matchSearch = o.patient.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    pending: orders.filter((o) => o.status === 'pending').length,
    approved: orders.filter((o) => o.status === 'approved').length,
    dispensed: orders.filter((o) => o.status === 'dispensed').length,
    total: orders.length,
  }

  const handleDispense = (id) => {
    const updated = orders.map((o) =>
      o.id === id ? { ...o, status: 'dispensed', dispensedDate: new Date().toLocaleDateString(), dispensedTime: new Date().toLocaleTimeString() } : o
    )
    saveOrders(updated)
    setSelectedOrder(null)
  }

  const statusColor = (status) => {
    if (status === 'approved') return { bg: 'var(--success-light)', color: 'var(--success)' }
    if (status === 'dispensed') return { bg: '#dbeafe', color: '#2563eb' }
    if (status === 'pending') return { bg: 'var(--warning-light)', color: 'var(--warning)' }
    return { bg: 'var(--danger-light)', color: 'var(--danger)' }
  }

  return (
    <div className="order-dispensing">
      <div className="page-header">
        <div>
          <h2>Online Order Dispensing</h2>
          <p className="page-subtitle">{counts.pending} pending, {counts.approved} ready for dispensing</p>
        </div>
      </div>

      <div className="user-stats-grid">
        <div className="user-stat-card">
          <div className="stat-content">
            <span className="stat-label">Ready to Dispense</span>
            <span className="stat-value">{counts.approved}</span>
          </div>
        </div>
        <div className="user-stat-card">
          <div className="stat-content">
            <span className="stat-label">Dispensed</span>
            <span className="stat-value">{counts.dispensed}</span>
          </div>
        </div>
        <div className="user-stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{counts.total}</span>
          </div>
        </div>
      </div>

      <div className="search-input" style={{ marginBottom: '1rem', maxWidth: '400px' }}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Search by patient name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          <Clock size={16} /> Pending {counts.pending > 0 && <span className="filter-count">{counts.pending}</span>}
        </button>
        <button className={`filter-tab ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>
          <CheckCircle size={16} /> Ready {counts.approved > 0 && <span className="filter-count">{counts.approved}</span>}
        </button>
        <button className={`filter-tab ${filter === 'dispensed' ? 'active' : ''}`} onClick={() => setFilter('dispensed')}>
          <PackageCheck size={16} /> Dispensed {counts.dispensed > 0 && <span className="filter-count">{counts.dispensed}</span>}
        </button>
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <PackageCheck size={48} />
          <h3>No orders found</h3>
          <p>No {filter !== 'all' ? filter : ''} orders at the moment</p>
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Medicines</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => {
                const sc = statusColor(order.status)
                return (
                  <tr key={order.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>
                      {order.patient}
                      <span style={{ fontSize: '.65rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '.1rem .35rem', borderRadius: 'var(--radius-full)', marginLeft: '.4rem' }}>
                        {order.source === 'cart' ? 'Cart' : 'Rx'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {order.medicines.map((m) => m.name).join(', ')}
                    </td>
                    <td className="price-cell">NPR {order.total}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{order.date}</td>
                    <td>
                      <span style={{ background: sc.bg, color: sc.color, padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn" title="View Details" onClick={() => setSelectedOrder(order)}>
                          <Eye size={16} />
                        </button>
                        {order.status === 'pending' && (
                          <button className="icon-btn" title="Approve" onClick={() => handleDispense(order.id)} style={{ color: 'var(--success)' }}>
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {order.status === 'approved' && (
                          <button className="icon-btn" title="Dispense" onClick={() => handleDispense(order.id)} style={{ color: 'var(--success)' }}>
                            <PackageCheck size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-box" onClick={(e => e.stopPropagation())} style={{ maxWidth: '500px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Order Details</h3>
              <button className="icon-btn" onClick={() => setSelectedOrder(null)}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Patient</span>
                <span style={{ fontWeight: 600 }}>{selectedOrder.patient}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Order Date</span>
                <span>{selectedOrder.date} {selectedOrder.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status</span>
                <span style={{ fontWeight: 600 }}>{selectedOrder.status}</span>
              </div>
              {selectedOrder.note && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Note</span>
                  <span>{selectedOrder.note}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Medicines</span>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedOrder.medicines.map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>{m.name} x{m.qty}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{m.frequency} for {m.days} days</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Total</span>
                <span className="price-cell" style={{ fontSize: '1rem', color: 'var(--primary)' }}>NPR {selectedOrder.total}</span>
              </div>
            </div>
            {selectedOrder.status === 'approved' && (
              <div style={{ marginTop: '1.25rem' }}>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleDispense(selectedOrder.id)}>
                  <PackageCheck size={16} /> Mark as Dispensed
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
