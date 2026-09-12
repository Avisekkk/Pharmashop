import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, Bell, ShoppingCart, ScanLine,
  Tag, Truck, Settings, ChevronLeft, ChevronRight, Plus
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'pharmacist', 'viewer'] },
  { to: '/inventory', icon: Package, label: 'Inventory', roles: ['admin', 'pharmacist', 'viewer'] },
  { to: '/alerts', icon: Bell, label: 'Alerts', roles: ['admin', 'pharmacist'] },
  { to: '/sales', icon: ShoppingCart, label: 'Sales', roles: ['admin', 'pharmacist'] },
  { to: '/ocr', icon: ScanLine, label: 'OCR Scan', roles: ['admin', 'pharmacist'] },
  { to: '/categories', icon: Tag, label: 'Categories', roles: ['admin'] },
  { to: '/suppliers', icon: Truck, label: 'Suppliers', roles: ['admin'] },
  { to: '/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
]

export default function Sidebar({ collapsed, onToggle, currentRole }) {
  const filtered = navItems.filter((item) => item.roles.includes(currentRole))

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-logo">
            <div className="logo-icon">
              <Plus size={20} />
            </div>
            <span className="logo-text">PharmaShop</span>
          </div>
        )}
        <button className="sidebar-toggle" onClick={onToggle}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="sidebar-nav">
        {filtered.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
