import { useState } from 'react'
import { Plus, Truck, Edit3, Trash2, Mail, Phone, MapPin, Star, Package } from 'lucide-react'

const initialSuppliers = [
  { id: 1, name: 'Sun Pharma Distributors', contact: 'Rajesh Mehta', email: 'rajesh@sunpharma.com', phone: '+91 98765 43210', address: 'Mumbai, Maharashtra', medicines: 120, rating: 4.5 },
  { id: 2, name: 'Cipla Logistics', contact: 'Amit Sharma', email: 'amit@cipla.com', phone: '+91 98765 43211', address: 'Mumbai, Maharashtra', medicines: 95, rating: 4.8 },
  { id: 3, name: 'Dr. Reddy\'s Supply Chain', contact: 'Priya Nair', email: 'priya@drreddys.com', phone: '+91 98765 43212', address: 'Hyderabad, Telangana', medicines: 85, rating: 4.2 },
  { id: 4, name: 'Zydus Cadila Medical', contact: 'Vikram Patel', email: 'vikram@zydus.com', phone: '+91 98765 43213', address: 'Ahmedabad, Gujarat', medicines: 78, rating: 4.6 },
  { id: 5, name: 'Alkem Laboratories', contact: 'Sanjay Kumar', email: 'sanjay@alkem.com', phone: '+91 98765 43214', address: 'Mumbai, Maharashtra', medicines: 65, rating: 4.3 },
]

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState(initialSuppliers)
  const [showForm, setShowForm] = useState(false)
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', email: '', phone: '', address: '' })

  const addSupplier = () => {
    if (newSupplier.name) {
      setSuppliers([...suppliers, { ...newSupplier, id: suppliers.length + 1, medicines: 0, rating: 0 }])
      setNewSupplier({ name: '', contact: '', email: '', phone: '', address: '' })
      setShowForm(false)
    }
  }

  return (
    <div className="suppliers-page">
      <div className="page-header">
        <div>
          <h2>Suppliers</h2>
          <p className="page-subtitle">{suppliers.length} registered suppliers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3 className="card-title">
            <Truck size={18} style={{ color: 'var(--secondary)' }} />
            New Supplier
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} placeholder="Company name" />
            </div>
            <div className="form-group">
              <label>Contact Person</label>
              <input type="text" value={newSupplier.contact} onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })} placeholder="Contact name" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={newSupplier.email} onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })} placeholder="email@company.com" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" value={newSupplier.phone} onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="form-group full-width">
              <label>Address</label>
              <input type="text" value={newSupplier.address} onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })} placeholder="City, State" />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={addSupplier}>Save</button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="suppliers-grid">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="supplier-card card">
            <div className="supplier-header">
              <div className="supplier-avatar">
                <Truck size={22} />
              </div>
              <div className="supplier-info">
                <h3>{supplier.name}</h3>
                <span className="supplier-contact">{supplier.contact}</span>
              </div>
            </div>
            <div className="supplier-details">
              <div className="detail-row"><Mail size={14} /> <span>{supplier.email}</span></div>
              <div className="detail-row"><Phone size={14} /> <span>{supplier.phone}</span></div>
              <div className="detail-row"><MapPin size={14} /> <span>{supplier.address}</span></div>
            </div>
            <div className="supplier-stats">
              <span><Package size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />{supplier.medicines} medicines</span>
              <span className="rating"><Star size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.15rem', fill: 'var(--warning)' }} /> {supplier.rating}</span>
            </div>
            <div className="supplier-actions">
              <button className="icon-btn" title="Edit"><Edit3 size={16} /></button>
              <button className="icon-btn danger" title="Delete"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
