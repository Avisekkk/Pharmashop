import { useState, useEffect } from 'react'
import {
  Users, Search, Eye, X, Phone, ShoppingCart, Calendar
} from 'lucide-react'

export default function PatientDirectory() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem('pharmashop_prescriptions') || '[]')
    const patientMap = {}
    orders.forEach((order) => {
      const name = order.patient
      if (!patientMap[name]) {
        patientMap[name] = {
          name,
          orders: [],
          totalSpent: 0,
          lastDate: order.date,
        }
      }
      patientMap[name].orders.push(order)
      patientMap[name].totalSpent += order.total
      if (order.date > patientMap[name].lastDate) {
        patientMap[name].lastDate = order.date
      }
    })
    setPatients(Object.values(patientMap).sort((a, b) => b.orders.length - a.orders.length))
  }, [])

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="patient-directory">
      <div className="page-header">
        <div>
          <h2>Patient Directory</h2>
          <p className="page-subtitle">{patients.length} registered patients</p>
        </div>
      </div>

      <div className="user-stats-grid">
        <div className="user-stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Patients</span>
            <span className="stat-value">{patients.length}</span>
          </div>
        </div>
        <div className="user-stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{patients.reduce((s, p) => s + p.orders.length, 0)}</span>
          </div>
        </div>
        <div className="user-stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">NPR {patients.reduce((s, p) => s + p.totalSpent, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="search-input" style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>No patients found</h3>
          <p>Patients will appear here once orders are placed</p>
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient Name</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Last Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient, i) => (
                <tr key={patient.name}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{patient.name}</td>
                  <td>
                    <span className="stock-badge in-stock">{patient.orders.length}</span>
                  </td>
                  <td className="price-cell">NPR {patient.totalSpent.toLocaleString()}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{patient.lastDate}</td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn" title="View History" onClick={() => setSelectedPatient(patient)}>
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedPatient && (
        <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Patient History</h3>
              <button className="icon-btn" onClick={() => setSelectedPatient(null)}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Name</span>
                <span style={{ fontWeight: 600 }}>{selectedPatient.name}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Orders</span>
                <span style={{ fontWeight: 600 }}>{selectedPatient.orders.length}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Total Spent</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>NPR {selectedPatient.totalSpent.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Order History</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {selectedPatient.orders.map((order) => {
                const sc = order.status === 'dispensed' ? { bg: '#dbeafe', color: '#2563eb' } :
                  order.status === 'approved' ? { bg: 'var(--success-light)', color: 'var(--success)' } :
                  order.status === 'pending' ? { bg: 'var(--warning-light)', color: 'var(--warning)' } :
                  { bg: 'var(--danger-light)', color: 'var(--danger)' }
                return (
                  <div key={order.id} style={{ padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600 }}>Order #{String(order.id).slice(-6)}</span>
                      <span style={{ background: sc.bg, color: sc.color, padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
                        {order.status}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {order.date} — {order.medicines.map((m) => m.name).join(', ')}
                    </div>
                    <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>NPR {order.total}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
