import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PrescriptionReview from './pages/PrescriptionReview'
import MyPrescriptions from './pages/MyPrescriptions'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Alerts from './pages/Alerts'
import Sales from './pages/Sales'
import OCRScan from './pages/OCRScan'
import Categories from './pages/Categories'
import Suppliers from './pages/Suppliers'
import Settings from './pages/Settings'
import UserManagement from './pages/UserManagement'
import MedicineApprovals from './pages/MedicineApprovals'
import FinancialReports from './pages/FinancialReports'
import OrderDispensing from './pages/OrderDispensing'
import PatientDirectory from './pages/PatientDirectory'
import MyOrders from './pages/MyOrders'
import ShoppingPage from './pages/ShoppingPage'
import Checkout from './pages/Checkout'

const DEFAULT_USERS = [
  { name: 'Admin', username: 'admin', password: 'admin123', role: 'admin' },
  { name: 'Pharmacist', username: 'pharmacist', password: 'pharmacist123', role: 'pharmacist' },
  { name: 'Customer', username: 'customer', password: 'customer123', role: 'customer' },
]

function seedDefaultUsers() {
  const version = localStorage.getItem('pharmashop_version')
  if (version !== '3') {
    localStorage.removeItem('pharmashop_users')
    localStorage.removeItem('pharmashop_current_user')
    localStorage.setItem('pharmashop_users', JSON.stringify(DEFAULT_USERS))
    localStorage.setItem('pharmashop_version', '3')
  }
}

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentRole, setCurrentRole] = useState('admin')
  const [showLogout, setShowLogout] = useState(false)
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    seedDefaultUsers()
    return !!localStorage.getItem('pharmashop_current_user')
  })
  const [authPage, setAuthPage] = useState('login')
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem('pharmashop_current_user') || '{}')
  })

  useEffect(() => {
    if (currentUser?.role) {
      setCurrentRole(currentUser.role)
    }
  }, [currentUser])

  const handleLogout = () => {
    localStorage.removeItem('pharmashop_current_user')
    setIsLoggedIn(false)
    setAuthPage('login')
    setShowLogout(false)
  }

  if (!isLoggedIn) {
    if (authPage === 'signup') {
      return <Signup onSignup={() => { setCurrentUser(JSON.parse(localStorage.getItem('pharmashop_current_user') || '{}')); setIsLoggedIn(true); }} onSwitchToLogin={() => setAuthPage('login')} />
    }
    return <Login onLogin={() => { setCurrentUser(JSON.parse(localStorage.getItem('pharmashop_current_user') || '{}')); setIsLoggedIn(true); }} onSwitchToSignup={() => setAuthPage('signup')} />
  }

  return (
    <div className="app-wrapper">
      <div className="portal-container">
        {currentRole !== 'customer' && (
          <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} currentRole={currentRole} />
        )}
        <div className={`main-content ${currentRole === 'customer' ? 'full-width' : ''}`}>
          <Header currentRole={currentRole} currentUser={currentUser} onLogout={() => setShowLogout(true)} cart={cart} onCartClick={() => setShowCart(true)} />
          <Routes>
            <Route path="/" element={
              currentUser?.role === 'customer'
                ? <ShoppingPage cart={cart} setCart={setCart} showCart={showCart} setShowCart={setShowCart} />
                : <Dashboard currentRole={currentRole} />
            } />
            <Route path="/inventory" element={<Inventory currentRole={currentRole} />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/sales" element={<Sales currentRole={currentRole} />} />
            <Route path="/ocr" element={<OCRScan />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/prescriptions" element={<PrescriptionReview />} />
            <Route path="/my-prescriptions" element={<MyPrescriptions cart={cart} setCart={setCart} />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/medicine-approvals" element={<MedicineApprovals />} />
            <Route path="/financial-reports" element={<FinancialReports />} />
            <Route path="/dispensing" element={<OrderDispensing />} />
            <Route path="/patients" element={<PatientDirectory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      {showLogout && (
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <LogOut size={28} />
            </div>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowLogout(false)}>
                No, Cancel
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
