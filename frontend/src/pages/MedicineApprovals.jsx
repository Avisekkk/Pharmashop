import { useState } from 'react'
import { ShieldCheck, CheckCircle, XCircle, Clock, Package, Search } from 'lucide-react'

const sampleMedicines = [
  { id: 1, name: 'Paracetamol 500mg', category: 'Analgesic', supplier: 'Himalaya Pharma', status: 'pending', submittedBy: 'Pharmacist', date: '2026-09-12' },
  { id: 2, name: 'Amoxicillin 500mg', category: 'Antibiotic', supplier: 'Nepal Chemists', status: 'pending', submittedBy: 'Pharmacist', date: '2026-09-12' },
  { id: 3, name: 'Cetirizine 10mg', category: 'Antihistamine', supplier: 'BhatBhateni Pharma', status: 'approved', submittedBy: 'Pharmacist', date: '2026-09-11' },
  { id: 4, name: 'Ibuprofen 400mg', category: 'NSAID', supplier: 'Himalaya Pharma', status: 'rejected', submittedBy: 'Pharmacist', date: '2026-09-10' },
]

export default function MedicineApprovals() {
  const [medicines, setMedicines] = useState(sampleMedicines)
  const [filter, setFilter] = useState('pending')
  const [search, setSearch] = useState('')

  const filtered = medicines.filter((m) =>
    (filter === 'all' || m.status === filter) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()))
  )

  const counts = {
    pending: medicines.filter((m) => m.status === 'pending').length,
    approved: medicines.filter((m) => m.status === 'approved').length,
    rejected: medicines.filter((m) => m.status === 'rejected').length,
    total: medicines.length,
  }

  const handleApprove = (id) => {
    setMedicines(medicines.map((m) => m.id === id ? { ...m, status: 'approved' } : m))
  }

  const handleReject = (id) => {
    setMedicines(medicines.map((m) => m.id === id ? { ...m, status: 'rejected' } : m))
  }

  const statusColor = (status) => {
    if (status === 'pending') return { bg: 'var(--warning-light)', color: 'var(--warning)' }
    if (status === 'approved') return { bg: 'var(--success-light)', color: 'var(--success)' }
    return { bg: 'var(--danger-light)', color: 'var(--danger)' }
  }

  return (
    <div className="medicine-approvals">
      <div className="page-header">
        <div>
          <h2>Medicine Approvals</h2>
          <p className="page-subtitle">{medicines.length} medicines submitted</p>
        </div>
      </div>

      <div className="user-stats-grid">
        <div className="user-stat-card">
          <div className="stat-content">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{counts.pending}</span>
          </div>
        </div>
        <div className="user-stat-card">
          <div className="stat-content">
            <span className="stat-label">Approved</span>
            <span className="stat-value">{counts.approved}</span>
          </div>
        </div>
        <div className="user-stat-card">
          <div className="stat-content">
            <span className="stat-label">Rejected</span>
            <span className="stat-value">{counts.rejected}</span>
          </div>
        </div>
        <div className="user-stat-card">
          <div className="stat-content">
            <span className="stat-label">Total</span>
            <span className="stat-value">{counts.total}</span>
          </div>
        </div>
      </div>

      <div className="search-input" style={{ marginBottom: '1rem', maxWidth: '400px' }}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          <Clock size={16} /> Pending {counts.pending > 0 && <span className="filter-count">{counts.pending}</span>}
        </button>
        <button className={`filter-tab ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>
          <CheckCircle size={16} /> Approved {counts.approved > 0 && <span className="filter-count">{counts.approved}</span>}
        </button>
        <button className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>
          <XCircle size={16} /> Rejected {counts.rejected > 0 && <span className="filter-count">{counts.rejected}</span>}
        </button>
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <h3>No medicines found</h3>
          <p>No {filter !== 'all' ? filter : ''} medicine approvals at the moment</p>
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Submitted By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((med, i) => {
                const sc = statusColor(med.status)
                return (
                  <tr key={med.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{med.name}</td>
                    <td><span className="category-badge">{med.category}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{med.supplier}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{med.submittedBy}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{med.date}</td>
                    <td>
                      <span className="rx-status" style={{ background: sc.bg, color: sc.color, padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {med.status.charAt(0).toUpperCase() + med.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {med.status === 'pending' && (
                        <div className="action-btns">
                          <button className="icon-btn" title="Approve" onClick={() => handleApprove(med.id)}>
                            <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                          </button>
                          <button className="icon-btn danger" title="Reject" onClick={() => handleReject(med.id)}>
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
