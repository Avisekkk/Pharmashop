import { useState } from 'react'
import {
  Bell, AlertTriangle, Clock, TrendingDown,
  CheckCircle, XCircle, Check, ShieldAlert, Zap
} from 'lucide-react'

const initialAlerts = [
  { id: 1, type: 'low-stock', severity: 'high', title: 'Critical Low Stock', message: 'Amlodipine 5mg has only 3 units remaining', medicine: 'Amlodipine 5mg', time: '5 min ago', is_read: false },
  { id: 2, type: 'expiry', severity: 'medium', title: 'Expiry Warning', message: 'Aspirin 75mg expires in 32 days', medicine: 'Aspirin 75mg', time: '1 hour ago', is_read: false },
  { id: 3, type: 'low-stock', severity: 'medium', title: 'Low Stock Alert', message: 'Cetirizine 10mg stock below threshold (8 units)', medicine: 'Cetirizine 10mg', time: '2 hours ago', is_read: false },
  { id: 4, type: 'approval', severity: 'low', title: 'Pending Approval', message: 'New medicine "Amlodipine 5mg" awaiting approval', medicine: 'Amlodipine 5mg', time: '3 hours ago', is_read: true },
  { id: 5, type: 'sales', severity: 'low', title: 'Sales Milestone', message: 'Paracetamol 500mg reached 300+ sales this month', medicine: 'Paracetamol 500mg', time: '1 day ago', is_read: true },
]

const severityConfig = {
  high: { icon: AlertTriangle, label: 'Critical' },
  medium: { icon: Clock, label: 'Warning' },
  low: { icon: Bell, label: 'Info' },
}

export default function Alerts() {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [filter, setFilter] = useState('all')

  const markRead = (id) => {
    setAlerts(alerts.map((a) => a.id === id ? { ...a, is_read: true } : a))
  }

  const markAllRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, is_read: true })))
  }

  const filtered = alerts.filter((a) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !a.is_read
    return a.type === filter
  })

  const unreadCount = alerts.filter((a) => !a.is_read).length

  return (
    <div className="alerts-page">
      <div className="page-header">
        <div>
          <h2>Alerts & Notifications</h2>
          <p className="page-subtitle">{unreadCount} unread alerts</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline" onClick={markAllRead}>
            <Check size={16} /> Mark All Read
          </button>
        )}
      </div>

      <div className="alert-filters">
        {['all', 'unread', 'low-stock', 'expiry', 'approval'].map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
            {f === 'unread' && unreadCount > 0 && (
              <span style={{ marginLeft: '0.3rem', background: 'rgba(255,255,255,0.3)', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontSize: '0.7rem' }}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="alerts-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={48} />
            <p>No alerts to display</p>
          </div>
        ) : (
          filtered.map((alert) => {
            const { icon: SeverityIcon } = severityConfig[alert.severity]
            return (
              <div key={alert.id} className={`alert-item severity-${alert.severity} ${alert.is_read ? 'read' : ''}`}>
                <div className={`alert-icon severity-${alert.severity}`}>
                  <SeverityIcon size={18} />
                </div>
                <div className="alert-content">
                  <div className="alert-header">
                    <span className="alert-title">{alert.title}</span>
                    <span className="alert-time">{alert.time}</span>
                  </div>
                  <p className="alert-message">{alert.message}</p>
                </div>
                <div className="alert-actions">
                  {!alert.is_read && (
                    <button className="icon-btn" onClick={() => markRead(alert.id)} title="Mark as read">
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button className="icon-btn danger" title="Dismiss">
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
