import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Alerts from './pages/Alerts'
import Sales from './pages/Sales'
import OCRScan from './pages/OCRScan'
import Categories from './pages/Categories'
import Suppliers from './pages/Suppliers'
import Settings from './pages/Settings'

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentRole, setCurrentRole] = useState('admin')

  return (
    <div className="app-wrapper">
      <div className="demo-role-banner">
        <span>Demo Mode — Switch Role:</span>
        <select
          className="demo-role-select"
          value={currentRole}
          onChange={(e) => setCurrentRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="pharmacist">Pharmacist</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      <div className="portal-container">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} currentRole={currentRole} />
        <div className="main-content">
          <Header currentRole={currentRole} />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory currentRole={currentRole} />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/sales" element={<Sales currentRole={currentRole} />} />
            <Route path="/ocr" element={<OCRScan />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
