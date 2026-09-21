import { useState, useEffect } from 'react'
import { Package, Clock, CheckCircle, XCircle, FileText, ShoppingCart } from 'lucide-react'

const statusConfig = {
  pending: { icon: Clock, color: 'var(--warning)', bg: 'var(--warning-light)', label: 'Pending' },
  approved: { icon: CheckCircle, color: 'var(--success)', bg: 'var(--primary-light)', label: 'Approved' },
  dispensed: { icon: Package, color: 'var(--accent)', bg: 'var(--accent-light)', label: 'Dispensed' },
  rejected: { icon: XCircle, color: 'var(--danger)', bg: 'var(--danger-light)', label: 'Rejected' },
}

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const cartOrders = JSON.parse(localStorage.getItem('pharmashop_orders') || '[]')
    const rxOrders = JSON.parse(localStorage.getItem('pharmashop_prescriptions') || '[]')

    const normalized = [
      ...cartOrders.map((o) => ({
        id: o.id,
        patient: o.patient || 'Walk-in',
        date: o.date,
        time: o.time,
        status: o.status || 'pending',
        source: 'cart',
        medicines: (o.medicines || []).map((m) => ({ name: m.name, qty: m.qty, price: m.price })),
        total: o.total || 0,
      })),
      ...rxOrders.map((o) => ({
        id: o.id,
        patient: o.patient || o.patientName || 'Patient',
        date: o.date,
        time: o.time,
        status: o.status || 'pending',
        source: 'prescription',
        medicines: (o.medicines || []).map((m) => ({ name: m.name, qty: m.qty, price: m.price || 0 })),
        total: o.total || 0,
      })),
    ]

    normalized.sort((a, b) => b.id - a.id)
    setOrders(normalized)
  }, [])

  const filtered = orders.filter((o) => filter === 'all' || o.status === filter)

  const counts = {
    pending: orders.filter((o) => o.status === 'pending').length,
    approved: orders.filter((o) => o.status === 'approved').length,
    dispensed: orders.filter((o) => o.status === 'dispensed').length,
    rejected: orders.filter((o) => o.status === 'rejected').length,
  }

  return (
    <div className="my-orders-page">
      <div className="page-header">
        <div>
          <h2>My Orders</h2>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({orders.length})
        </button>
        <button className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          <Clock size={14} /> Pending {counts.pending > 0 && <span className="filter-count">{counts.pending}</span>}
        </button>
        <button className={`filter-tab ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>
          <CheckCircle size={14} /> Approved {counts.approved > 0 && <span className="filter-count">{counts.approved}</span>}
        </button>
        <button className={`filter-tab ${filter === 'dispensed' ? 'active' : ''}`} onClick={() => setFilter('dispensed')}>
          <Package size={14} /> Dispensed {counts.dispensed > 0 && <span className="filter-count">{counts.dispensed}</span>}
        </button>
        <button className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>
          <XCircle size={14} /> Rejected {counts.rejected > 0 && <span className="filter-count">{counts.rejected}</span>}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No orders found</h3>
          <p>{filter === 'all' ? "You haven't placed any orders yet." : `No ${filter} orders.`}</p>
        </div>
      ) : (
        <div className="prescription-list">
          {filtered.map((order) => {
            const sc = statusConfig[order.status] || statusConfig.pending
            const StatusIcon = sc.icon
            return (
              <div key={order.id} className="rx-card">
                <div className="rx-card-header">
                  <div className="rx-id">
                    {order.source === 'cart' ? <ShoppingCart size={16} /> : <FileText size={16} />}
                    <span>Order #{String(order.id).slice(-6)}</span>
                    <span style={{ fontSize: '.7rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '.1rem .4rem', borderRadius: 'var(--radius-full)' }}>
                      {order.source === 'cart' ? 'Cart' : 'Prescription'}
                    </span>
                  </div>
                  <span className="rx-status" style={{ background: sc.bg, color: sc.color }}>
                    <StatusIcon size={12} /> {sc.label}
                  </span>
                </div>
                <div className="rx-card-body">
                  <div className="rx-info-grid">
                    <div className="rx-info-item">
                      <span className="rx-info-label">Date</span>
                      <span className="rx-info-value">{order.date} at {order.time}</span>
                    </div>
                    <div className="rx-info-item">
                      <span className="rx-info-label">Patient</span>
                      <span className="rx-info-value">{order.patient}</span>
                    </div>
                  </div>
                  <div className="rx-meds">
                    <span className="rx-meds-title">Medicines ({order.medicines.length})</span>
                    {order.medicines.map((med, i) => (
                      <div key={i} className="rx-med-row">
                        <span className="rx-med-name">{med.name}</span>
                        <span className="rx-med-detail">{med.qty} x {med.price ? `NPR ${med.price}` : '-'}</span>
                      </div>
                    ))}
                  </div>
                  {order.total > 0 && (
                    <div style={{ marginTop: '.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                      Total: NPR {order.total.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
