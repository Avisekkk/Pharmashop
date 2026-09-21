import { Bell, Search, LogOut, X, ChevronDown, ClipboardList, FileText, ShoppingCart, Upload } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getNotifications, markAllRead as storeMarkAllRead, removeNotification as storeRemove } from '../notifications'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function Header({ currentRole, currentUser, onLogout, cart, onCartClick }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notifications, setNotifications] = useState([])
  const profileRef = useRef(null)
  const displayName = currentUser?.name || currentRole

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = useCallback(() => {
    const all = getNotifications()
    const filtered = all.filter((n) => n.roles.includes(currentRole))
    setNotifications(filtered)
  }, [currentRole])

  useEffect(() => {
    loadNotifications()
    window.addEventListener('notifications-updated', loadNotifications)
    window.addEventListener('storage', loadNotifications)
    const interval = setInterval(loadNotifications, 3000)
    return () => {
      window.removeEventListener('notifications-updated', loadNotifications)
      window.removeEventListener('storage', loadNotifications)
      clearInterval(interval)
    }
  }, [loadNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length
  const cartCount = cart ? cart.reduce((sum, c) => sum + c.qty, 0) : 0

  const handleMarkAllRead = () => {
    storeMarkAllRead()
    loadNotifications()
  }

  const handleRemoveNotification = (id) => {
    storeRemove(id)
    loadNotifications()
  }

  return (
    <header className="main-header">
      <div className="header-left">
        <h1 className="page-title">
          {currentRole === 'customer' ? (
            <Link to="/" className="header-brand">PharmaShop</Link>
          ) : (
            <>{getGreeting()}, {displayName}</>
          )}
        </h1>
      </div>
      <div className="header-right">
        {currentRole === 'customer' ? (
          <Link to="/my-prescriptions?upload=true" className="header-upload-btn">
            <Upload size={18} />
            <span>Upload Prescription</span>
          </Link>
        ) : (
          <div className={`header-search ${searchOpen ? 'open' : ''}`}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search medicines, suppliers..."
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        )}
        {currentRole === 'customer' && (
          <button className="header-icon-btn" title="My Cart" onClick={onCartClick} style={{ position: 'relative' }}>
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="notification-badge">{cartCount}</span>}
          </button>
        )}
        <div className="notification-wrapper">
          <button
            className="header-icon-btn"
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button className="notification-mark-read" onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
                      <div className="notification-content">
                        <span className="notification-title">{n.title}</span>
                        <span className="notification-message">{n.message}</span>
                        <span className="notification-time">{n.time}</span>
                      </div>
                      <button className="notification-remove" onClick={() => handleRemoveNotification(n.id)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="header-user" ref={profileRef} style={{ position: 'relative' }}>
          <button className="header-user-btn" onClick={() => setShowProfile(!showProfile)}>
            <div className="user-info" style={{ textAlign: 'right' }}>
              <span className="user-name">{displayName}</span>
              <span className="user-role">{currentRole}</span>
            </div>
            <div className="user-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <ChevronDown size={16} style={{ marginLeft: 4, opacity: 0.6 }} />
          </button>
          {showProfile && (
            <div className="profile-dropdown">
              {currentRole === 'customer' && (
                <>
                  <Link to="/my-orders" className="profile-dropdown-item" onClick={() => setShowProfile(false)}>
                    <ClipboardList size={16} />
                    <span>My Orders</span>
                  </Link>
                  <Link to="/my-prescriptions" className="profile-dropdown-item" onClick={() => setShowProfile(false)}>
                    <FileText size={16} />
                    <span>My Prescriptions</span>
                  </Link>
                  <div className="profile-dropdown-divider" />
                </>
              )}
              <button className="profile-dropdown-item profile-dropdown-logout" onClick={onLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
