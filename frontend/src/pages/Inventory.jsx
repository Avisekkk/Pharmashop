import { useState } from 'react'
import {
  Plus, Search, Filter, Edit3, Trash2, Eye,
  LayoutGrid, List, ShoppingCart, X, Minus, Upload, AlertTriangle, CheckCircle, ArrowLeft
} from 'lucide-react'
import { getMedicineImageWithFallback } from '../medicineImages'
import { addNotification } from '../notifications'

const medicines = [
  { id: 1, name: 'Paracetamol 500mg', generic: 'Acetaminophen', category: 'Analgesic', batch: 'PCM-2024-001', stock: 150, price: 120, cost: 85, expiry: '2027-06-30', status: 'approved', dosage_form: 'Tablet', prescription_required: false },
  { id: 2, name: 'Amoxicillin 500mg', generic: 'Amoxicillin Trihydrate', category: 'Antibiotics & Anti-Infectives', batch: 'AMX-2024-002', stock: 45, price: 450, cost: 320, expiry: '2027-03-15', status: 'approved', dosage_form: 'Capsule', prescription_required: true },
  { id: 3, name: 'Cetirizine 10mg', generic: 'Cetirizine Dihydrochloride', category: 'Respiratory & Allergy', batch: 'CTZ-2024-003', stock: 8, price: 85, cost: 55, expiry: '2027-09-20', status: 'approved', dosage_form: 'Tablet', prescription_required: false },
  { id: 4, name: 'Metformin 500mg', generic: 'Metformin Hydrochloride', category: 'Antidiabetic', batch: 'MET-2024-004', stock: 200, price: 320, cost: 210, expiry: '2027-12-10', status: 'approved', dosage_form: 'Tablet', prescription_required: true },
  { id: 6, name: 'Omeprazole 20mg', generic: 'Omeprazole', category: 'Gastrointestinal', batch: 'OMP-2024-006', stock: 80, price: 180, cost: 120, expiry: '2027-07-18', status: 'approved', dosage_form: 'Capsule', prescription_required: false },
  { id: 7, name: 'Azithromycin 500mg', generic: 'Azithromycin', category: 'Antibiotics & Anti-Infectives', batch: 'AZT-2024-007', stock: 60, price: 350, cost: 240, expiry: '2027-05-30', status: 'approved', dosage_form: 'Tablet', prescription_required: true },
  { id: 8, name: 'Pantoprazole 40mg', generic: 'Pantoprazole Sodium', category: 'Gastrointestinal', batch: 'PAN-2024-008', stock: 120, price: 220, cost: 150, expiry: '2027-11-05', status: 'pending', dosage_form: 'Tablet', prescription_required: false },
  { id: 10, name: 'Vitamin C 500mg', generic: 'Ascorbic Acid', category: 'Vitamins & Supplements', batch: 'VTC-2024-011', stock: 200, price: 150, cost: 90, expiry: '2027-12-01', status: 'approved', dosage_form: 'Chewable Tablet', prescription_required: false },
  { id: 11, name: 'Ciprofloxacin 500mg', generic: 'Ciprofloxacin HCl', category: 'Antibiotics & Anti-Infectives', batch: 'CIP-2024-010', stock: 35, price: 280, cost: 190, expiry: '2027-04-22', status: 'approved', dosage_form: 'Tablet', prescription_required: true },
]

const stockStatus = (stock) => {
  if (stock <= 5) return 'critical'
  if (stock <= 20) return 'low-stock'
  return 'in-stock'
}

const stockLabel = (stock) => {
  if (stock <= 5) return 'Low Stock'
  if (stock <= 20) return 'Low Stock'
  return 'In Stock'
}

const categoryColor = (cat) => {
  const colors = {
    'Analgesic': { bg: '#f8fafc', text: '#64748b' },
    'Antibiotics & Anti-Infectives': { bg: '#f8fafc', text: '#64748b' },
    'Respiratory & Allergy': { bg: '#f8fafc', text: '#64748b' },
    'Antidiabetic': { bg: '#f8fafc', text: '#64748b' },
    'Cardiovascular': { bg: '#f8fafc', text: '#64748b' },
    'Gastrointestinal': { bg: '#f8fafc', text: '#64748b' },
    'Vitamins & Supplements': { bg: '#f8fafc', text: '#64748b' },
  }
  return colors[cat] || { bg: '#f8fafc', text: '#64748b' }
}

const getStoredPrescriptions = () => {
  try {
    return JSON.parse(localStorage.getItem('pharmashop_prescriptions') || '[]')
  } catch {
    return []
  }
}

const savePrescription = (rx) => {
  const existing = getStoredPrescriptions()
  localStorage.setItem('pharmashop_prescriptions', JSON.stringify([rx, ...existing]))
}

const saveOrder = (order) => {
  const orders = JSON.parse(localStorage.getItem('pharmashop_orders') || '[]')
  localStorage.setItem('pharmashop_orders', JSON.stringify([order, ...orders]))
}

export default function Inventory({ currentRole }) {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [viewMode, setViewMode] = useState('card')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [showRxModal, setShowRxModal] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [detailQty, setDetailQty] = useState(1)
  const [rxForm, setRxForm] = useState({ doctorName: '', patientName: '', image: null, imagePreview: null })

  const categories = [...new Set(medicines.map((m) => m.category))]
  const filtered = medicines.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.generic.toLowerCase().includes(search.toLowerCase())
    const matchCategory = filterCategory === 'all' || m.category === filterCategory
    return matchSearch && matchCategory
  })

  const addToCart = (med) => {
    const existing = cart.find((c) => c.id === med.id)
    if (existing) {
      setCart(cart.map((c) => c.id === med.id ? { ...c, qty: c.qty + 1 } : c))
    } else {
      setCart([...cart, { ...med, qty: 1 }])
    }
  }

  const updateQty = (id, delta) => {
    setCart(cart.map((c) => {
      if (c.id === id) {
        const newQty = c.qty + delta
        return newQty > 0 ? { ...c, qty: newQty } : c
      }
      return c
    }).filter((c) => c.qty > 0))
  }

  const removeFromCart = (id) => {
    setCart(cart.filter((c) => c.id !== id))
  }

  const cartTotal = cart.reduce((sum, c) => sum + (c.price * c.qty), 0)
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0)
  const hasRxItems = cart.some((c) => c.prescription_required)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setRxForm({ ...rxForm, image: file, imagePreview: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const placeOrder = (prescriptionId) => {
    const order = {
      id: Date.now(),
      patient: rxForm.patientName || 'Walk-in',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: 'pending',
      prescriptionId,
      medicines: cart.map((c) => ({ name: c.name, qty: c.qty, price: c.price })),
      total: cartTotal,
    }
    saveOrder(order)
    addNotification({
      title: 'New Order',
      message: `Order #${order.id} from ${order.patient} - NPR ${order.total}`,
      roles: ['admin', 'pharmacist'],
      type: 'order',
    })
    if (prescriptionId) {
      addNotification({
        title: 'Prescription Uploaded',
        message: `Prescription for ${order.patient} submitted with order #${order.id}`,
        roles: ['admin', 'pharmacist'],
        type: 'prescription',
      })
    }
    setCart([])
    setShowCart(false)
    setOrderSuccess(true)
    setTimeout(() => setOrderSuccess(false), 2500)
  }

  const handlePlaceOrder = () => {
    if (hasRxItems) {
      setShowRxModal(true)
      return
    }
    placeOrder(null)
  }

  const handleRxSubmit = () => {
    if (!rxForm.doctorName.trim() || !rxForm.patientName.trim()) return
    const prescription = {
      id: Date.now(),
      doctorName: rxForm.doctorName.trim(),
      patientName: rxForm.patientName.trim(),
      image: rxForm.imagePreview,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: 'pending',
      medicines: cart.filter((c) => c.prescription_required).map((c) => c.name),
    }
    savePrescription(prescription)
    placeOrder(prescription.id)
    setShowRxModal(false)
    setRxForm({ doctorName: '', patientName: '', image: null, imagePreview: null })
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h2>Inventory Management</h2>
          <p className="page-subtitle">{medicines.length} medicines in stock</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="view-toggle">
            <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')} title="Table View">
              <List size={16} />
            </button>
            <button className={viewMode === 'card' ? 'active' : ''} onClick={() => setViewMode('card')} title="Card View">
              <LayoutGrid size={16} />
            </button>
          </div>
          {currentRole === 'customer' && (
            <button className="btn btn-outline" onClick={() => setShowCart(true)} style={{ position: 'relative' }}>
              <ShoppingCart size={18} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          )}
          {(currentRole === 'admin' || currentRole === 'pharmacist') && (
            <button className="btn btn-primary">
              <Plus size={18} /> Add Medicine
            </button>
          )}
        </div>
      </div>

      {orderSuccess && (
        <div className="order-success-banner">
          <CheckCircle size={18} /> Order placed successfully. Awaiting pharmacist review.
        </div>
      )}

      <div className="filters-bar">
        <div className="search-input">
          <Search size={18} />
          <input type="text" placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} />
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

      {viewMode === 'table' ? (
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((med) => {
                const cc = categoryColor(med.category)
                return (
                  <tr key={med.id}>
                    <td>
                      <div className="medicine-cell">
                        <img {...getMedicineImageWithFallback(med.name)} alt={med.name} className="medicine-thumb" />
                        <div>
                          <span className="medicine-name">
                            {med.name}
                            {med.prescription_required && <span className="rx-badge">Rx</span>}
                          </span>
                          <span className="medicine-form">{med.generic}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="category-badge" style={{ background: cc.bg, color: cc.text }}>{med.category}</span></td>
                    <td><span className={`stock-badge ${stockStatus(med.stock)}`}>{med.stock}</span></td>
                    <td className="price-cell">NPR {med.price}</td>
                    <td>{med.expiry}</td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn" title="View" onClick={() => setSelectedMedicine(med)}><Eye size={16} /></button>
                        {currentRole === 'customer' && (
                          <button className="icon-btn" title="Add to Cart" onClick={() => addToCart(med)} style={{ color: 'var(--primary)' }}>
                            <ShoppingCart size={16} />
                          </button>
                        )}
                        {currentRole !== 'customer' && (
                          <button className="icon-btn" title="Edit"><Edit3 size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="med-grid">
          {filtered.map((med) => {
            const cc = categoryColor(med.category)
            return (
              <div key={med.id} className="med-card card">
                <div className="med-card-image">
                  <img {...getMedicineImageWithFallback(med.name)} alt={med.name} />
                </div>
                <div className="med-card-body">
                  <div className="med-card-badges">
                    <span className="med-badge med-badge-category" style={{ background: cc.bg, color: cc.text }}>{med.category}</span>
                    <span className={`med-badge med-badge-stock ${stockStatus(med.stock)}`}>{stockLabel(med.stock)}</span>
                  </div>
                  <h3 className="med-card-name">
                    {med.name}
                    {med.prescription_required && <span className="rx-badge">Rx</span>}
                  </h3>
                  <p className="med-card-generic">{med.generic}</p>
                  <p className="med-card-form">Form: {med.dosage_form}</p>
                  <div className="med-card-footer">
                    <div className="med-card-price">
                      <span className="med-price-label">Price</span>
                      <span className="med-price-value">NPR {med.price}</span>
                    </div>
                    <div className="med-card-actions">
                      <button className="icon-btn" title="View" onClick={() => setSelectedMedicine(med)}><Eye size={16} /></button>
                      {currentRole === 'customer' ? (
                        <button className="btn btn-primary btn-sm" onClick={() => addToCart(med)}>
                          <ShoppingCart size={14} /> Add
                        </button>
                      ) : (
                        <button className="icon-btn" title="Edit"><Edit3 size={16} /></button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCart && (
        <div className="modal-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3><ShoppingCart size={18} /> My Cart ({cartCount})</h3>
              <button className="icon-btn" onClick={() => setShowCart(false)}><X size={18} /></button>
            </div>
            {cart.length === 0 ? (
              <div className="cart-empty">
                <ShoppingCart size={40} />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                {hasRxItems && (
                  <div className="rx-notice">
                    <AlertTriangle size={14} />
                    <span>This order contains prescription medicines. A valid prescription is required.</span>
                  </div>
                )}
                <div className="cart-items">
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item">
                      <img {...getMedicineImageWithFallback(item.name)} alt={item.name} className="cart-item-img" />
                      <div className="cart-item-info">
                        <span className="cart-item-name">
                          {item.name}
                          {item.prescription_required && <span className="rx-badge">Rx</span>}
                        </span>
                        <span className="cart-item-price">NPR {item.price}</span>
                        <div className="cart-item-qty">
                          <button onClick={() => updateQty(item.id, -1)}><Minus size={14} /></button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)}><Plus size={14} /></button>
                        </div>
                      </div>
                      <div className="cart-item-right">
                        <span className="cart-item-total">NPR {item.price * item.qty}</span>
                        <button className="icon-btn danger" onClick={() => removeFromCart(item.id)}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-total-row">
                    <span>Total</span>
                    <span className="cart-total-value">NPR {cartTotal}</span>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={handlePlaceOrder}>
                    <ShoppingCart size={16} /> Place Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showRxModal && (
        <div className="modal-overlay" onClick={() => setShowRxModal(false)}>
          <div className="rx-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rx-modal-header">
              <h3>Upload Prescription</h3>
              <button className="icon-btn" onClick={() => setShowRxModal(false)}><X size={18} /></button>
            </div>
            <p className="rx-modal-subtitle">Your cart contains prescription medicines. Please upload a valid prescription from a licensed doctor.</p>

            <div className="rx-form">
              <div className="rx-form-group">
                <label>Patient Name</label>
                <input
                  type="text"
                  placeholder="Enter patient name"
                  value={rxForm.patientName}
                  onChange={(e) => setRxForm({ ...rxForm, patientName: e.target.value })}
                />
              </div>
              <div className="rx-form-group">
                <label>Doctor Name</label>
                <input
                  type="text"
                  placeholder="Enter doctor name"
                  value={rxForm.doctorName}
                  onChange={(e) => setRxForm({ ...rxForm, doctorName: e.target.value })}
                />
              </div>
              <div className="rx-form-group">
                <label>Prescription Image</label>
                <label className="rx-upload-area">
                  {rxForm.imagePreview ? (
                    <img src={rxForm.imagePreview} alt="Prescription" className="rx-preview" />
                  ) : (
                    <>
                      <Upload size={24} />
                      <span>Click to upload (JPG, PNG)</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                </label>
              </div>
            </div>

            <div className="rx-modal-actions">
              <button className="btn btn-outline" onClick={() => setShowRxModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleRxSubmit}
                disabled={!rxForm.doctorName.trim() || !rxForm.patientName.trim()}
              >
                Submit & Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedMedicine && (
        <div className="detail-overlay">
          <div className="detail-topbar">
            <button className="detail-back" onClick={() => setSelectedMedicine(null)}>
              <ArrowLeft size={18} /> Back to Inventory
            </button>
            <button className="detail-close-btn" onClick={() => setSelectedMedicine(null)}>
              <X size={18} />
            </button>
          </div>
          <div className="detail-modal">
            <div className="detail-modal-layout">
              <div className="detail-modal-image">
                <img {...getMedicineImageWithFallback(selectedMedicine.name)} alt={selectedMedicine.name} />
              </div>
              <div className="detail-modal-right">
                <div className="detail-top-section">
                  <h2 className="detail-modal-name">{selectedMedicine.name}</h2>
                  <p className="detail-modal-generic">{selectedMedicine.generic}</p>
                  <div className="detail-modal-badges">
                    <span className="detail-modal-category">{selectedMedicine.category}</span>
                    <span className={`med-badge med-badge-stock ${stockStatus(selectedMedicine.stock)}`}>{stockLabel(selectedMedicine.stock)}</span>
                    {selectedMedicine.prescription_required && <span className="rx-badge">Rx Required</span>}
                  </div>
                </div>

                <div className="detail-divider" />

                <div className="detail-price-box">
                  <div className="detail-price-main">
                    <span className="detail-modal-price">NPR {selectedMedicine.price}</span>
                    <span className="detail-price-unit">per unit</span>
                  </div>
                  <div className="detail-stock-info">
                    <span className="detail-stock-count">{selectedMedicine.stock}</span>
                    <span className="detail-stock-label">units in stock</span>
                  </div>
                </div>

                <div className="detail-divider" />

                {currentRole === 'customer' && selectedMedicine.stock > 0 && (
                  <div className="detail-buy-section">
                    <div className="detail-qty-row">
                      <span className="detail-qty-label">Quantity</span>
                      <div className="detail-modal-qty">
                        <button onClick={() => setDetailQty(Math.max(1, detailQty - 1))}>-</button>
                        <span>{detailQty}</span>
                        <button onClick={() => setDetailQty(Math.min(selectedMedicine.stock, detailQty + 1))}>+</button>
                      </div>
                    </div>
                    <div className="detail-btn-row">
                      <button className="btn btn-primary detail-btn-cart" onClick={() => {
                        for (let i = 0; i < detailQty; i++) addToCart(selectedMedicine)
                        setDetailQty(1)
                        setSelectedMedicine(null)
                      }}>
                        <ShoppingCart size={16} /> Add to Cart
                      </button>
                      <button className="btn btn-outline detail-btn-buy" onClick={() => {
                        for (let i = 0; i < detailQty; i++) addToCart(selectedMedicine)
                        setDetailQty(1)
                        setSelectedMedicine(null)
                        setShowCart(true)
                      }}>
                        Buy Now
                      </button>
                    </div>
                  </div>
                )}
                {selectedMedicine.stock === 0 && (
                  <div className="detail-modal-out">Out of Stock</div>
                )}

                <div className="detail-divider" />

                <div className="detail-meta-grid">
                  <div className="detail-meta-item">
                    <span className="detail-meta-label">Dosage Form</span>
                    <span className="detail-meta-value">{selectedMedicine.dosage_form}</span>
                  </div>
                  <div className="detail-meta-item">
                    <span className="detail-meta-label">Batch No.</span>
                    <span className="detail-meta-value">{selectedMedicine.batch}</span>
                  </div>
                  <div className="detail-meta-item">
                    <span className="detail-meta-label">Expiry Date</span>
                    <span className="detail-meta-value">{selectedMedicine.expiry}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
