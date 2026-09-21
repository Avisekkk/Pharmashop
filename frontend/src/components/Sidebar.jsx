import { NavLink, Link } from 'react-router-dom'
import {
  BarChart3, Users, ClipboardCheck, ShieldCheck, Package,
  FileBarChart, Bell, LayoutDashboard, ScanLine,
  FileText, ClipboardList, ChevronLeft, ChevronRight, PackageCheck
} from 'lucide-react'

const adminNavItems = [
  { section: 'ADMINISTRATION' },
  { to: '/', icon: BarChart3, label: 'Analytics' },
  { to: '/user-management', icon: Users, label: 'User Management' },
  { to: '/prescriptions', icon: ClipboardCheck, label: 'Pharmacist Approvals' },
  { to: '/medicine-approvals', icon: ShieldCheck, label: 'Medicine Approvals' },
  { to: '/inventory', icon: Package, label: 'Medicine Inventory' },
  { to: '/financial-reports', icon: FileBarChart, label: 'Financial Reports' },
  { to: '/alerts', icon: Bell, label: 'Central Alerts' },
]

const pharmacistNavItems = [
  { section: 'PHARMACIST' },
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/prescriptions', icon: ClipboardCheck, label: 'Prescription Review' },
  { to: '/dispensing', icon: PackageCheck, label: 'Order Dispensing' },
  { to: '/patients', icon: Users, label: 'Patient Directory' },
  { to: '/ocr', icon: ScanLine, label: 'OCR Scan' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
]

const customerNavItems = [
  { section: 'CUSTOMER' },
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/my-orders', icon: ClipboardList, label: 'My Orders' },
  { to: '/my-prescriptions', icon: ClipboardList, label: 'My Prescriptions' },
]

function getNavItems(role) {
  if (role === 'admin') return adminNavItems
  if (role === 'pharmacist') return pharmacistNavItems
  return customerNavItems
}

export default function Sidebar({ collapsed, onToggle, currentRole }) {
  const navItems = getNavItems(currentRole)

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <Link to="/" className="sidebar-brand">
        {!collapsed && (
          <div className="sidebar-brand-text">
            <span className="brand-name">PharmaShop</span>
            <span className="brand-subtitle">{currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Dashboard</span>
          </div>
        )}
        {!collapsed && (
          <button className="sidebar-toggle" onClick={onToggle}>
            <ChevronLeft size={18} />
          </button>
        )}
        {collapsed && (
          <button className="sidebar-toggle" onClick={onToggle}>
            <ChevronRight size={18} />
          </button>
        )}
      </Link>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => {
          if (item.section) {
            return !collapsed ? (
              <div key={item.section} className="nav-section">
                {item.section}
              </div>
            ) : (
              <div key={item.section} className="nav-divider" />
            )
          }
          return (
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
          )
        })}
      </nav>
    </aside>
  )
}
