import { useState } from 'react'
import {
  Plus, Search, Filter, Edit3, Trash2, Eye,
  ChevronLeft, ChevronRight, Package
} from 'lucide-react'

const medicines = [
  { id: 1, name: 'Paracetamol 500mg', category: 'Analgesic', manufacturer: 'Cipla', batch: 'PCM-2024-001', stock: 150, price: 25, cost: 18, expiry: '2027-06-30', status: 'approved', dosage_form: 'Tablet' },
  { id: 2, name: 'Amoxicillin 500mg', category: 'Antibiotic', manufacturer: 'Sun Pharma', batch: 'AMX-2024-002', stock: 45, price: 120, cost: 85, expiry: '2027-03-15', status: 'approved', dosage_form: 'Capsule' },
  { id: 3, name: 'Cetirizine 10mg', category: 'Antihistamine', manufacturer: 'Dr. Reddy\'s', batch: 'CTZ-2024-003', stock: 8, price: 35, cost: 22, expiry: '2027-09-20', status: 'approved', dosage_form: 'Tablet' },
  { id: 4, name: 'Metformin 500mg', category: 'Antidiabetic', manufacturer: 'USV Ltd', batch: 'MET-2024-004', stock: 200, price: 45, cost: 30, expiry: '2027-12-10', status: 'approved', dosage_form: 'Tablet' },
  { id: 5, name: 'Amlodipine 5mg', category: 'Antihypertensive', manufacturer: 'Pfizer', batch: 'AML-2024-005', stock: 3, price: 55, cost: 38, expiry: '2027-08-25', status: 'pending', dosage_form: 'Tablet' },
  { id: 6, name: 'Omeprazole 20mg', category: 'Antacid', manufacturer: 'AstraZeneca', batch: 'OMP-2024-006', stock: 80, price: 65, cost: 42, expiry: '2027-07-18', status: 'approved', dosage_form: 'Capsule' },
  { id: 7, name: 'Azithromycin 500mg', category: 'Antibiotic', manufacturer: 'Zydus Cadila', batch: 'AZT-2024-007', stock: 60, price: 95, cost: 68, expiry: '2027-05-30', status: 'approved', dosage_form: 'Tablet' },
  { id: 8, name: 'Pantoprazole 40mg', category: 'Antacid', manufacturer: 'Alkem Labs', batch: 'PAN-2024-008', stock: 120, price: 78, cost: 52, expiry: '2027-11-05', status: 'pending', dosage_form: 'Tablet' },
  { id: 9, name: 'Montelukast 10mg', category: 'Anti-Asthmatic', manufacturer: 'Cipla', batch: 'MON-2024-009', stock: 95, price: 110, cost: 75, expiry: '2027-10-12', status: 'approved', dosage_form: 'Tablet' },
  { id: 10, name: 'Ciprofloxacin 500mg', category: 'Antibiotic', manufacturer: 'Ranbaxy', batch: 'CIP-2024-010', stock: 35, price: 85, cost: 58, expiry: '2027-04-22', status: 'approved', dosage_form: 'Tablet' },
]

const stockStatus = (stock) => {
  if (stock <= 5) return 'critical'
  if (stock <= 20) return 'low-stock'
  return 'in-stock'
}

export default function Inventory({ currentRole }) {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showModal, setShowModal] = useState(false)

  const categories = [...new Set(medicines.map((m) => m.category))]
  const filtered = medicines.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.manufacturer.toLowerCase().includes(search.toLowerCase())
    const matchCategory = filterCategory === 'all' || m.category === filterCategory
    return matchSearch && matchCategory
  })

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h2>Inventory Management</h2>
          <p className="page-subtitle">{medicines.length} medicines in stock</p>
        </div>
        {(currentRole === 'admin' || currentRole === 'pharmacist') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Add Medicine
          </button>
        )}
      </div>

      <div className="filters-bar">
        <div className="search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={18} />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Category</th>
              <th>Manufacturer</th>
              <th>Batch</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((med) => (
              <tr key={med.id}>
                <td>
                  <div className="medicine-cell">
                    <Package size={16} />
                    <div>
                      <span className="medicine-name">{med.name}</span>
                      <span className="medicine-form">{med.dosage_form}</span>
                    </div>
                  </div>
                </td>
                <td><span className="category-badge">{med.category}</span></td>
                <td>{med.manufacturer}</td>
                <td><code className="batch-code">{med.batch}</code></td>
                <td>
                  <span className={`stock-badge ${stockStatus(med.stock)}`}>
                    {med.stock}
                  </span>
                </td>
                <td className="price-cell">₹{med.price}</td>
                <td>{med.expiry}</td>
                <td>
                  <span className={`approval-badge ${med.status}`}>
                    {med.status}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="icon-btn" title="View"><Eye size={16} /></button>
                    {currentRole !== 'viewer' && (
                      <>
                        <button className="icon-btn" title="Edit"><Edit3 size={16} /></button>
                        {currentRole === 'admin' && (
                          <button className="icon-btn danger" title="Delete"><Trash2 size={16} /></button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
