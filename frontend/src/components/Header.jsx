import { Bell, Search, User } from 'lucide-react'
import { useState } from 'react'

export default function Header({ currentRole }) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="main-header">
      <div className="header-left">
        <h1 className="page-title">Pharmacy Management System</h1>
      </div>
      <div className="header-right">
        <div className={`header-search ${searchOpen ? 'open' : ''}`}>
          <Search size={18} />
          <input type="text" placeholder="Search medicines..." />
        </div>
        <button className="header-icon-btn" title="Notifications">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        <div className="header-user">
          <div className="user-avatar">
            <User size={18} />
          </div>
          <div className="user-info">
            <span className="user-name">Admin</span>
            <span className="user-role">{currentRole}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
