import { useState } from 'react'
import {
  Plus, Search, ShoppingCart, Trash2, Receipt,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react'

const salesHistory = [
  { id: 'S001', items: ['Paracetamol 500mg x3', 'Cetirizine 10mg x2'], total: 145, customer: 'Walk-in', date: '2026-09-13', time: '10:30 AM' },
  { id: 'S002', items: ['Amoxicillin 500mg x1', 'Omeprazole 20mg x2'], total: 250, customer: 'Rajesh Kumar', date: '2026-09-13', time: '09:45 AM' },
  { id: 'S003', items: ['Metformin 500mg x2', 'Amlodipine 5mg x1'], total: 145, customer: 'Priya Sharma', date: '2026-09-12', time: '05:15 PM' },
  { id: 'S004', items: ['Azithromycin 500mg x1'], total: 95, customer: 'Walk-in', date: '2026-09-12', time: '02:30 PM' },
  { id: 'S005', items: ['Montelukast 10mg x2', 'Pantoprazole 40mg x1'], total: 300, customer: 'Amit Singh', date: '2026-09-11', time: '11:00 AM' },
]

const cartItems = [
  { id: 1, name: 'Paracetamol 500mg', price: 25, qty: 2, total: 50 },
  { id: 2, name: 'Amoxicillin 500mg', price: 120, qty: 1, total: 120 },
]

export default function Sales({ currentRole }) {
  const [showNewSale, setShowNewSale] = useState(false)

  const todaySales = salesHistory.filter((s) => s.date === '2026-09-13')
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0)

  return (
    <div className="sales-page">
      <div className="page-header">
        <div>
          <h2>Sales & Billing</h2>
          <p className="page-subtitle">Manage prescriptions and sales</p>
        </div>
        {(currentRole === 'admin' || currentRole === 'pharmacist') && (
          <button className="btn btn-primary" onClick={() => setShowNewSale(!showNewSale)}>
            <Plus size={18} /> New Sale
          </button>
        )}
      </div>

      <div className="sales-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#05966915', color: '#059669' }}>
            <Receipt size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Today's Sales</span>
            <span className="stat-value">₹{todayTotal.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#6366f115', color: '#6366f1' }}>
            <ShoppingCart size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Today's Transactions</span>
            <span className="stat-value">{todaySales.length}</span>
          </div>
        </div>
      </div>

      {showNewSale && (
        <div className="card new-sale-card">
          <h3 className="card-title">New Sale</h3>
          <div className="sale-form">
            <div className="search-input">
              <Search size={18} />
              <input type="text" placeholder="Search medicine to add..." />
            </div>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <span className="cart-name">{item.name}</span>
                  <span className="cart-price">₹{item.price}</span>
                  <div className="qty-control">
                    <button>-</button>
                    <span>{item.qty}</span>
                    <button>+</button>
                  </div>
                  <span className="cart-total">₹{item.total}</span>
                  <button className="icon-btn danger"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="sale-total">
              <span>Total:</span>
              <span className="total-amount">₹{cartItems.reduce((s, i) => s + i.total, 0)}</span>
            </div>
            <button className="btn btn-primary">Complete Sale</button>
          </div>
        </div>
      )}

      <div className="card table-card">
        <h3 className="card-title">Sales History</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date & Time</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {salesHistory.map((sale) => (
              <tr key={sale.id}>
                <td><code className="batch-code">{sale.id}</code></td>
                <td>{sale.date} {sale.time}</td>
                <td>{sale.customer}</td>
                <td>
                  <div className="items-list">
                    {sale.items.map((item, i) => (
                      <span key={i} className="item-tag">{item}</span>
                    ))}
                  </div>
                </td>
                <td className="price-cell">₹{sale.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
