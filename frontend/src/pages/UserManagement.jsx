import { useState, useEffect } from 'react'
import { Users, Trash2, User, Search, Plus, UserPlus } from 'lucide-react'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'customer' })

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('pharmashop_users') || '[]')
    setUsers(stored)
  }, [])

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    total: users.length,
    admin: users.filter((u) => u.role === 'admin').length,
    pharmacist: users.filter((u) => u.role === 'pharmacist').length,
    customer: users.filter((u) => u.role === 'customer').length,
  }

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.username.trim() || !newUser.password.trim()) return
    if (users.find((u) => u.username === newUser.username)) return
    const updated = [...users, { ...newUser }]
    setUsers(updated)
    localStorage.setItem('pharmashop_users', JSON.stringify(updated))
    setNewUser({ name: '', username: '', password: '', role: 'customer' })
    setShowAddModal(false)
  }

  const handleDelete = (username) => {
    if (username === 'admin') return
    const updated = users.filter((u) => u.username !== username)
    setUsers(updated)
    localStorage.setItem('pharmashop_users', JSON.stringify(updated))
    setShowDeleteConfirm(null)
  }

  const handleRoleChange = (username, newRole) => {
    if (username === 'admin') return
    const updated = users.map((u) => u.username === username ? { ...u, role: newRole } : u)
    setUsers(updated)
    localStorage.setItem('pharmashop_users', JSON.stringify(updated))
  }

  const roleColor = (role) => {
    if (role === 'admin') return { bg: 'var(--danger-light)', color: 'var(--danger)' }
    if (role === 'pharmacist') return { bg: 'var(--primary-light)', color: 'var(--primary)' }
    return { bg: 'var(--success-light)', color: 'var(--success)' }
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <div>
          <h2>User Management</h2>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="user-stats-grid">
        <div className="user-stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{counts.total}</span>
          </div>
        </div>
        <div className="user-stat-card">
          <div className="stat-content">
            <span className="stat-label">Admins</span>
            <span className="stat-value">{counts.admin}</span>
          </div>
        </div>
        <div className="user-stat-card">
          <div className="stat-content">
            <span className="stat-label">Pharmacists</span>
            <span className="stat-value">{counts.pharmacist}</span>
          </div>
        </div>
        <div className="user-stat-card">
          <div className="stat-content">
            <span className="stat-label">Customers</span>
            <span className="stat-value">{counts.customer}</span>
          </div>
        </div>
      </div>

      <div className="search-input" style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => {
              const rc = roleColor(user.role)
              return (
                <tr key={user.username}>
                  <td>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: rc.bg, color: rc.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} />
                      </div>
                      <span style={{ fontWeight: 600 }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{user.username}</td>
                  <td>
                    {user.username === 'admin' ? (
                      <span className="category-badge" style={{ background: rc.bg, color: rc.color }}>
                        Admin
                      </span>
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.username, e.target.value)}
                        className="role-select"
                        style={{
                          background: rc.bg,
                          color: rc.color,
                          border: 'none',
                          borderRadius: '9999px',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        <option value="admin">Admin</option>
                        <option value="pharmacist">Pharmacist</option>
                        <option value="customer">Customer</option>
                      </select>
                    )}
                  </td>
                  <td>
                    <div className="action-btns">
                      {user.username !== 'admin' && (
                        <button
                          className="icon-btn danger"
                          title="Delete"
                          onClick={() => setShowDeleteConfirm(user.username)}
                        >
                          <Trash2 size={16} />
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

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <UserPlus size={28} />
            </div>
            <h3>Add New User</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="form-input"
                >
                  <option value="customer">Customer</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddUser}
                disabled={!newUser.name.trim() || !newUser.username.trim() || !newUser.password.trim()}
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
              <Trash2 size={28} />
            </div>
            <h3>Delete User</h3>
            <p>Are you sure you want to delete <strong>{showDeleteConfirm}</strong>? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(showDeleteConfirm)}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
