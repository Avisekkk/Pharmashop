import { useState, useEffect } from 'react'
import {
  CheckCircle, XCircle, Clock, FileText,
  User, Calendar, Stethoscope
} from 'lucide-react'
import { addNotification } from '../notifications'

export default function PrescriptionReview() {
  const [prescriptions, setPrescriptions] = useState([])
  const [filter, setFilter] = useState('pending')
  const [rejectNote, setRejectNote] = useState('')
  const [rejectId, setRejectId] = useState(null)

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem('pharmashop_prescriptions') || '[]')
    setPrescriptions(orders)
  }, [])

  const savePrescriptions = (updated) => {
    setPrescriptions(updated)
    localStorage.setItem('pharmashop_prescriptions', JSON.stringify(updated))
  }

  const filtered = prescriptions.filter((p) => filter === 'all' || p.status === filter)

  const counts = {
    pending: prescriptions.filter((p) => p.status === 'pending').length,
    approved: prescriptions.filter((p) => p.status === 'approved').length,
    rejected: prescriptions.filter((p) => p.status === 'rejected').length,
  }

  const handleApprove = (id) => {
    const rx = prescriptions.find((p) => p.id === id)
    const updated = prescriptions.map((p) =>
      p.id === id ? { ...p, status: 'approved', note: 'Approved by pharmacist' } : p
    )
    savePrescriptions(updated)
    if (rx) {
      addNotification({
        title: 'Prescription Approved',
        message: `Your prescription for ${rx.patient} has been approved`,
        roles: ['customer'],
        type: 'prescription_approved',
      })
    }
  }

  const handleReject = (id) => {
    if (!rejectNote.trim()) return
    const rx = prescriptions.find((p) => p.id === id)
    const updated = prescriptions.map((p) =>
      p.id === id ? { ...p, status: 'rejected', note: rejectNote } : p
    )
    savePrescriptions(updated)
    setRejectId(null)
    setRejectNote('')
    if (rx) {
      addNotification({
        title: 'Prescription Rejected',
        message: `Your prescription for ${rx.patient} was rejected: ${rejectNote}`,
        roles: ['customer'],
        type: 'prescription_rejected',
      })
    }
  }

  const statusColor = (status) => {
    if (status === 'pending') return 'var(--warning)'
    if (status === 'approved') return 'var(--success)'
    return 'var(--danger)'
  }

  const statusBg = (status) => {
    if (status === 'pending') return 'var(--warning-light)'
    if (status === 'approved') return 'var(--success-light)'
    return 'var(--danger-light)'
  }

  return (
    <div className="prescription-review">
      <div className="page-header">
        <h2>Prescription Review</h2>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          <Clock size={16} /> Pending {counts.pending > 0 && <span className="filter-count">{counts.pending}</span>}
        </button>
        <button
          className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          <CheckCircle size={16} /> Approved {counts.approved > 0 && <span className="filter-count">{counts.approved}</span>}
        </button>
        <button
          className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          <XCircle size={16} /> Rejected {counts.rejected > 0 && <span className="filter-count">{counts.rejected}</span>}
        </button>
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No prescriptions found</h3>
          <p>No {filter !== 'all' ? filter : ''} prescriptions at the moment</p>
        </div>
      ) : (
        <div className="prescription-list">
          {filtered.map((rx) => (
            <div key={rx.id} className="rx-card">
              <div className="rx-card-header">
                <div className="rx-id">
                  <FileText size={16} />
                  <span>Order #{String(rx.id).slice(-6)}</span>
                </div>
                <span className="rx-status" style={{ background: statusBg(rx.status), color: statusColor(rx.status) }}>
                  {rx.status.charAt(0).toUpperCase() + rx.status.slice(1)}
                </span>
              </div>

              <div className="rx-card-body">
                <div className="rx-info-grid">
                  <div className="rx-info-item">
                    <User size={14} />
                    <div>
                      <span className="rx-info-label">Patient</span>
                      <span className="rx-info-value">{rx.patient || rx.patientName}</span>
                    </div>
                  </div>
                  <div className="rx-info-item">
                    <Calendar size={14} />
                    <div>
                      <span className="rx-info-label">Date</span>
                      <span className="rx-info-value">{rx.date} at {rx.time}</span>
                    </div>
                  </div>
                </div>

                <div className="rx-meds">
                  <span className="rx-meds-title">Prescribed Medicines ({rx.medicines.length})</span>
                  {rx.medicines.map((med, i) => {
                    const name = typeof med === 'string' ? med : med.name
                    const detail = typeof med === 'string' ? '' : `${med.qty} x ${med.days} days - ${med.frequency}`
                    return (
                      <div key={i} className="rx-med-row">
                        <span className="rx-med-name">{name}</span>
                        {detail && <span className="rx-med-detail">{detail}</span>}
                      </div>
                    )
                  })}
                </div>

                {rx.total > 0 && (
                  <div style={{ marginTop: '0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                    Total: NPR {rx.total.toLocaleString()}
                  </div>
                )}

                {rx.note && (
                  <div className="rx-note">
                    <strong>Note:</strong> {rx.note}
                  </div>
                )}
              </div>

              {rx.status === 'pending' && (
                <div className="rx-card-actions">
                  <button className="btn btn-primary" onClick={() => handleApprove(rx.id)}>
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button className="btn btn-danger" onClick={() => setRejectId(rx.id)}>
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              )}

              {rejectId === rx.id && (
                <div className="reject-form">
                  <input
                    type="text"
                    placeholder="Reason for rejection..."
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    className="reject-input"
                    autoFocus
                  />
                  <div className="reject-actions">
                    <button className="btn btn-danger" onClick={() => handleReject(rx.id)} disabled={!rejectNote.trim()}>
                      Confirm Reject
                    </button>
                    <button className="btn btn-outline" onClick={() => { setRejectId(null); setRejectNote('') }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
