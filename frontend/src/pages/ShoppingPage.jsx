import { useState, useMemo } from 'react'
import {
  Search, ShoppingCart, X, Minus, Plus, Eye, ArrowLeft,
  AlertTriangle, CheckCircle, Upload, Star, Truck, Shield, Pill
} from 'lucide-react'
import { getMedicineImageWithFallback } from '../medicineImages'
import { addNotification } from '../notifications'

const medicines = [
  { id: 1, name: 'Paracetamol 500mg', generic: 'Acetaminophen', category: 'Analgesic', batch: 'PCM-2024-001', stock: 150, price: 120, cost: 85, expiry: '2027-06-30', status: 'approved', dosage_form: 'Tablet', prescription_required: false, description: 'Effective pain reliever and fever reducer. Used for mild to moderate pain relief including headaches, muscle aches, and cold symptoms.' },
  { id: 2, name: 'Amoxicillin 500mg', generic: 'Amoxicillin Trihydrate', category: 'Antibiotics & Anti-Infectives', batch: 'AMX-2024-002', stock: 45, price: 450, cost: 320, expiry: '2027-03-15', status: 'approved', dosage_form: 'Capsule', prescription_required: true, description: 'Broad-spectrum antibiotic for treating bacterial infections. Effective against respiratory, urinary, and soft tissue infections.' },
  { id: 3, name: 'Cetirizine 10mg', generic: 'Cetirizine Dihydrochloride', category: 'Respiratory & Allergy', batch: 'CTZ-2024-003', stock: 8, price: 85, cost: 55, expiry: '2027-09-20', status: 'approved', dosage_form: 'Tablet', prescription_required: false, description: 'Non-drowsy antihistamine for relief of allergy symptoms including sneezing, runny nose, and itchy eyes.' },
  { id: 4, name: 'Metformin 500mg', generic: 'Metformin Hydrochloride', category: 'Antidiabetic', batch: 'MET-2024-004', stock: 200, price: 320, cost: 210, expiry: '2027-12-10', status: 'approved', dosage_form: 'Tablet', prescription_required: true, description: 'First-line medication for the treatment of type 2 diabetes. Helps control blood sugar levels.' },
  { id: 6, name: 'Omeprazole 20mg', generic: 'Omeprazole', category: 'Gastrointestinal', batch: 'OMP-2024-006', stock: 80, price: 180, cost: 120, expiry: '2027-07-18', status: 'approved', dosage_form: 'Capsule', prescription_required: false, description: 'Proton pump inhibitor for treating acid reflux, heartburn, and stomach ulcers. Reduces stomach acid production.' },
  { id: 7, name: 'Azithromycin 500mg', generic: 'Azithromycin', category: 'Antibiotics & Anti-Infectives', batch: 'AZT-2024-007', stock: 60, price: 350, cost: 240, expiry: '2027-05-30', status: 'approved', dosage_form: 'Tablet', prescription_required: true, description: 'Macrolide antibiotic for treating a variety of bacterial infections including respiratory, skin, and ear infections.' },
  { id: 10, name: 'Vitamin C 500mg', generic: 'Ascorbic Acid', category: 'Vitamins & Supplements', batch: 'VTC-2024-011', stock: 200, price: 150, cost: 90, expiry: '2027-12-01', status: 'approved', dosage_form: 'Chewable Tablet', prescription_required: false, description: 'Essential vitamin supplement supporting immune function, skin health, and antioxidant protection.' },
  { id: 11, name: 'Ciprofloxacin 500mg', generic: 'Ciprofloxacin HCl', category: 'Antibiotics & Anti-Infectives', batch: 'CIP-2024-010', stock: 35, price: 280, cost: 190, expiry: '2027-04-22', status: 'approved', dosage_form: 'Tablet', prescription_required: true, description: 'Fluoroquinolone antibiotic for treating serious bacterial infections including urinary tract and respiratory infections.' },
]

const categories = ['All', ...new Set(medicines.map(m => m.category))]

const categoryIcons = {
  'All': Pill,
  'Analgesic': Pill,
  'Antibiotics & Anti-Infectives': Shield,
  'Respiratory & Allergy': Pill,
  'Antidiabetic': Pill,
  'Gastrointestinal': Pill,
  'Vitamins & Supplements': Pill,
}

const stockStatus = (stock) => {
  if (stock <= 5) return 'critical'
  if (stock <= 20) return 'low-stock'
  return 'in-stock'
}

const stockLabel = (stock) => {
  if (stock <= 5) return 'Only a few left'
  if (stock <= 20) return 'Low Stock'
  return 'In Stock'
}

const getStoredPrescriptions = () => {
  try { return JSON.parse(localStorage.getItem('pharmashop_prescriptions') || '[]') }
  catch { return [] }
}

const savePrescription = (rx) => {
  const existing = getStoredPrescriptions()
  localStorage.setItem('pharmashop_prescriptions', JSON.stringify([rx, ...existing]))
}

const saveOrder = (order) => {
  const orders = JSON.parse(localStorage.getItem('pharmashop_orders') || '[]')
  localStorage.setItem('pharmashop_orders', JSON.stringify([order, ...orders]))
}

export default function ShoppingPage({ cart, setCart, showCart, setShowCart }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [detailQty, setDetailQty] = useState(1)
  const [showRxModal, setShowRxModal] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [rxForm, setRxForm] = useState({ doctorName: '', patientName: '', image: null, imagePreview: null })

  const filtered = useMemo(() => {
    return medicines.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.generic.toLowerCase().includes(search.toLowerCase())
      const matchCategory = activeCategory === 'All' || m.category === activeCategory
      return matchSearch && matchCategory
    })
  }, [search, activeCategory])

  const popularMedicines = medicines.filter(m => m.stock > 50 && !m.prescription_required)

  const addToCart = (med) => {
    const existing = cart.find(c => c.id === med.id)
    if (existing) {
      setCart(cart.map(c => c.id === med.id ? { ...c, qty: c.qty + 1 } : c))
    } else {
      setCart([...cart, { ...med, qty: 1 }])
    }
  }

  const updateQty = (id, delta) => {
    setCart(cart.map(c => {
      if (c.id === id) {
        const newQty = c.qty + delta
        return newQty > 0 ? { ...c, qty: newQty } : c
      }
      return c
    }).filter(c => c.qty > 0))
  }

  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.id !== id))
  }

  const cartTotal = cart.reduce((sum, c) => sum + (c.price * c.qty), 0)
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0)
  const hasRxItems = cart.some(c => c.prescription_required)

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
      medicines: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price })),
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
    setTimeout(() => setOrderSuccess(false), 3000)
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
      medicines: cart.filter(c => c.prescription_required).map(c => c.name),
    }
    savePrescription(prescription)
    placeOrder(prescription.id)
    setShowRxModal(false)
    setRxForm({ doctorName: '', patientName: '', image: null, imagePreview: null })
  }

  const openProduct = (med) => {
    setSelectedProduct(med)
    setDetailQty(1)
  }

  if (selectedProduct) {
    return (
      <div className="shop-detail">
        <div className="shop-detail-topbar">
          <button className="shop-detail-back" onClick={() => setSelectedProduct(null)}>
            <ArrowLeft size={18} /> Back to Shop
          </button>
          <button className="shop-detail-cart-btn" onClick={() => setShowCart(true)}>
            <ShoppingCart size={18} />
            {cartCount > 0 && <span className="shop-cart-badge">{cartCount}</span>}
          </button>
        </div>
        <div className="shop-detail-content">
          <div className="shop-detail-image-section">
            <div className="shop-detail-image-wrapper">
              <img {...getMedicineImageWithFallback(selectedProduct.name)} alt={selectedProduct.name} />
            </div>
          </div>
          <div className="shop-detail-info-section">
            <div className="shop-detail-badges">
              <span className="shop-detail-category">{selectedProduct.category}</span>
              {selectedProduct.prescription_required && <span className="shop-rx-badge">Rx Required</span>}
            </div>
            <h1 className="shop-detail-name">{selectedProduct.name}</h1>
            <p className="shop-detail-generic">{selectedProduct.generic}</p>
            <p className="shop-detail-form">Dosage Form: {selectedProduct.dosage_form}</p>

            <div className="shop-detail-divider" />

            <div className="shop-detail-price-box">
              <span className="shop-detail-price">NPR {selectedProduct.price}</span>
              <span className="shop-detail-unit">per unit</span>
            </div>

            <div className={`shop-detail-stock ${stockStatus(selectedProduct.stock)}`}>
              {stockLabel(selectedProduct.stock)}
              <span className="shop-detail-stock-count">({selectedProduct.stock} available)</span>
            </div>

            <div className="shop-detail-divider" />

            {selectedProduct.stock > 0 ? (
              <div className="shop-detail-buy">
                <div className="shop-detail-qty-row">
                  <span className="shop-detail-qty-label">Quantity</span>
                  <div className="shop-detail-qty-control">
                    <button onClick={() => setDetailQty(Math.max(1, detailQty - 1))} disabled={detailQty <= 1}>
                      <Minus size={16} />
                    </button>
                    <span>{detailQty}</span>
                    <button onClick={() => setDetailQty(Math.min(selectedProduct.stock, detailQty + 1))} disabled={detailQty >= selectedProduct.stock}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="shop-detail-total">
                  Total: <strong>NPR {selectedProduct.price * detailQty}</strong>
                </div>
                <div className="shop-detail-actions">
                  <button className="shop-btn shop-btn-cart" onClick={() => {
                    for (let i = 0; i < detailQty; i++) addToCart(selectedProduct)
                    setDetailQty(1)
                  }}>
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                  <button className="shop-btn shop-btn-buy" onClick={() => {
                    for (let i = 0; i < detailQty; i++) addToCart(selectedProduct)
                    setDetailQty(1)
                    setSelectedProduct(null)
                    setShowCart(true)
                  }}>
                    Buy Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="shop-detail-out-of-stock">Out of Stock</div>
            )}

            <div className="shop-detail-divider" />

            <div className="shop-detail-description">
              <h3>Description</h3>
              <p>{selectedProduct.description}</p>
            </div>

            <div className="shop-detail-meta">
              <div className="shop-detail-meta-item">
                <span className="shop-detail-meta-label">Batch No.</span>
                <span className="shop-detail-meta-value">{selectedProduct.batch}</span>
              </div>
              <div className="shop-detail-meta-item">
                <span className="shop-detail-meta-label">Expiry Date</span>
                <span className="shop-detail-meta-value">{selectedProduct.expiry}</span>
              </div>
            </div>

            <div className="shop-detail-features">
              <div className="shop-detail-feature">
                <Truck size={18} />
                <span>Free delivery on orders over NPR 500</span>
              </div>
              <div className="shop-detail-feature">
                <Shield size={18} />
                <span>100% genuine medicines</span>
              </div>
            </div>
          </div>
        </div>

        {showCart && renderCartSidebar()}
      </div>
    )
  }

  const renderCartSidebar = () => (
    <div className="modal-overlay" onClick={() => setShowCart(false)}>
      <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h3><ShoppingCart size={18} /> My Cart ({cartCount})</h3>
          <button className="icon-btn" onClick={() => setShowCart(false)}><X size={18} /></button>
        </div>
        {cart.length === 0 ? (
          <div className="cart-empty">
            <ShoppingCart size={48} />
            <p>Your cart is empty</p>
            <span>Add medicines to get started</span>
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
              {cart.map(item => (
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
                    <button className="icon-btn danger" onClick={() => removeFromCart(item.id)}><X size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="cart-total-row">
                <span>Total</span>
                <span className="cart-total-value">NPR {cartTotal}</span>
              </div>
              <button className="shop-btn shop-btn-buy" style={{ width: '100%' }} onClick={handlePlaceOrder}>
                <ShoppingCart size={16} /> Place Order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className="shop-page">
      {orderSuccess && (
        <div className="shop-order-success">
          <CheckCircle size={18} /> Order placed successfully! Awaiting pharmacist review.
        </div>
      )}

      <div className="shop-hero">
        <div className="shop-hero-content">
          <div className="shop-hero-badge">Your Trusted Online Pharmacy</div>
          <h1 className="shop-hero-title">Buy Medicines<br /><span>Online</span></h1>
          <p className="shop-hero-subtitle">Order genuine medicines with fast delivery. Prescriptions verified by licensed pharmacists.</p>
          <div className="shop-hero-search">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search medicines, health products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="shop-hero-features">
            <div className="shop-hero-feature">
              <Truck size={18} />
              <span>Fast Delivery</span>
            </div>
            <div className="shop-hero-feature">
              <Shield size={18} />
              <span>Genuine Products</span>
            </div>
            <div className="shop-hero-feature">
              <Star size={18} />
              <span>Verified Pharmacists</span>
            </div>
          </div>
        </div>
        <div className="shop-hero-visual">
          <div className="shop-hero-circle">
            <Pill size={80} />
          </div>
        </div>
      </div>

      <div className="shop-categories-bar">
        <div className="shop-categories-scroll">
          {categories.map(cat => (
              <button
                key={cat}
                className={`shop-category-chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                <span>{cat === 'All' ? 'All Medicines' : cat}</span>
              </button>
            ))}
        </div>
      </div>

      <div className="shop-section">
        <div className="shop-section-header">
          <h2>{activeCategory === 'All' ? 'All Medicines' : activeCategory}</h2>
          <span className="shop-section-count">{filtered.length} products</span>
        </div>
        <div className="shop-product-grid">
          {filtered.length === 0 ? (
            <div className="shop-no-results">
              <Search size={40} />
              <p>No medicines found</p>
              <span>Try a different search term or category</span>
            </div>
          ) : (
            filtered.map(med => (
              <div key={med.id} className="shop-product-card" onClick={() => openProduct(med)}>
                <div className="shop-product-image">
                  <img {...getMedicineImageWithFallback(med.name)} alt={med.name} />
                  {med.prescription_required && <span className="shop-product-rx">Rx</span>}
                  {med.stock <= 20 && med.stock > 0 && <span className="shop-product-low-stock">Low Stock</span>}
                </div>
                <div className="shop-product-info">
                  <span className="shop-product-category">{med.category}</span>
                  <h3 className="shop-product-name">{med.name}</h3>
                  <p className="shop-product-generic">{med.generic}</p>
                  <div className="shop-product-bottom">
                    <div className="shop-product-price">
                      <span className="shop-product-current">NPR {med.price}</span>
                    </div>
                    {med.stock > 0 ? (
                      <button className="shop-product-add" onClick={e => { e.stopPropagation(); addToCart(med) }}>
                        <ShoppingCart size={16} />
                      </button>
                    ) : (
                      <span className="shop-product-oos">Out of Stock</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {activeCategory === 'All' && !search && (
        <div className="shop-section">
          <div className="shop-section-header">
            <h2>Popular Medicines</h2>
            <span className="shop-section-count">Recommended for you</span>
          </div>
          <div className="shop-product-grid">
            {popularMedicines.map(med => (
              <div key={med.id} className="shop-product-card" onClick={() => openProduct(med)}>
                <div className="shop-product-image">
                  <img {...getMedicineImageWithFallback(med.name)} alt={med.name} />
                </div>
                <div className="shop-product-info">
                  <span className="shop-product-category">{med.category}</span>
                  <h3 className="shop-product-name">{med.name}</h3>
                  <p className="shop-product-generic">{med.generic}</p>
                  <div className="shop-product-bottom">
                    <div className="shop-product-price">
                      <span className="shop-product-current">NPR {med.price}</span>
                    </div>
                    <button className="shop-product-add" onClick={e => { e.stopPropagation(); addToCart(med) }}>
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {cartCount > 0 && (
        <div className="shop-floating-cart" onClick={() => setShowCart(true)}>
          <ShoppingCart size={22} />
          <span className="shop-floating-count">{cartCount}</span>
          <span className="shop-floating-total">NPR {cartTotal}</span>
        </div>
      )}

      {showCart && renderCartSidebar()}

      {showRxModal && (
        <div className="modal-overlay" onClick={() => setShowRxModal(false)}>
          <div className="rx-modal" onClick={e => e.stopPropagation()}>
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
                  onChange={e => setRxForm({ ...rxForm, patientName: e.target.value })}
                />
              </div>
              <div className="rx-form-group">
                <label>Doctor Name</label>
                <input
                  type="text"
                  placeholder="Enter doctor name"
                  value={rxForm.doctorName}
                  onChange={e => setRxForm({ ...rxForm, doctorName: e.target.value })}
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
              <button className="shop-btn shop-btn-outline" onClick={() => setShowRxModal(false)}>Cancel</button>
              <button
                className="shop-btn shop-btn-buy"
                onClick={handleRxSubmit}
                disabled={!rxForm.doctorName.trim() || !rxForm.patientName.trim()}
              >
                Submit & Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
