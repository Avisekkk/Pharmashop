import { useState, useRef } from 'react'
import {
  Clock, ArrowUpRight, ArrowDownRight,
  Upload, FileText, CheckCircle, Edit3, Trash2, Plus,
  ShoppingCart, BarChart3, Zap, ScanLine, X
} from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement, PointElement, LineElement
} from 'chart.js'
import { getMedicineImageWithFallback } from '../medicineImages'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title,
  Tooltip, Legend, ArcElement, PointElement, LineElement
)

const adminStats = [
  { label: 'Total Medicines', value: '1,247' },
  { label: 'Low Stock Alerts', value: '23' },
  { label: 'Monthly Sales', value: 'NPR 2,45,800' },
  { label: 'Today\'s Revenue', value: 'NPR 12,450' },
]

const pharmacistStats = [
  { label: 'My Prescriptions', value: '18' },
  { label: 'Low Stock Items', value: '23' },
  { label: 'Today\'s Sales', value: 'NPR 12,450' },
  { label: 'Pending Reviews', value: '7' },
]

const customerStats = [
  { label: 'My Orders', value: '5', change: '2 pending', up: true },
  { label: 'Monthly Spend', value: 'NPR 3,200', change: '-5%', up: false },
  { label: 'Active Prescriptions', value: '2', change: '1 new', up: true },
  { label: 'Loyalty Points', value: '480', change: '+120', up: true },
]

const salesChartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Sales (NPR)',
      data: [12400, 15600, 11200, 18900, 16700, 22300, 14500],
      backgroundColor: 'rgba(5, 150, 105, 0.7)',
      borderRadius: 4,
      borderSkipped: false,
      barThickness: 24,
    },
  ],
}

const salesChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0f172a',
      padding: 8,
      cornerRadius: 6,
      titleFont: { weight: '600', size: 12 },
      bodyFont: { size: 11 },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(241, 245, 249, 0.5)', drawBorder: false },
      ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v) => (v / 1000) + 'k' },
      border: { display: false },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#94a3b8', font: { size: 10, weight: '500' } },
      border: { display: false },
    },
  },
}

const expiryItems = [
  { name: 'Aspirin 75mg', expiry: '2026-10-15', days: 32 },
  { name: 'Vitamin D3', expiry: '2026-11-20', days: 68 },
  { name: 'Iron Supplement', expiry: '2026-12-01', days: 79 },
]

const topSelling = [
  { name: 'Paracetamol 500mg', sold: 342, revenue: 'NPR 8,550' },
  { name: 'Amoxicillin 500mg', sold: 218, revenue: 'NPR 26,160' },
  { name: 'Cetirizine 10mg', sold: 185, revenue: 'NPR 6,475' },
]

export default function Dashboard({ currentRole }) {
  const [prescriptionFile, setPrescriptionFile] = useState(null)
  const [prescriptionPreview, setPrescriptionPreview] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [prescriptionMeds, setPrescriptionMeds] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [showPrescriptionTable, setShowPrescriptionTable] = useState(false)
  const [showOrderSuccess, setShowOrderSuccess] = useState(false)
  const [patientName, setPatientName] = useState('')
  const fileInputRef = useRef(null)

  const getCustomerStats = () => {
    const cartOrders = JSON.parse(localStorage.getItem('pharmashop_orders') || '[]')
    const rxOrders = JSON.parse(localStorage.getItem('pharmashop_prescriptions') || '[]')
    const allOrders = [...cartOrders, ...rxOrders]
    const totalSpend = allOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    return [
      { label: 'My Orders', value: String(allOrders.length) },
      { label: 'Total Spend', value: `NPR ${totalSpend.toLocaleString()}` },
      { label: 'Active Prescriptions', value: String(rxOrders.filter((o) => o.status !== 'rejected').length) },
      { label: 'Loyalty Points', value: '480' },
    ]
  }

  const stats = currentRole === 'admin' ? adminStats : currentRole === 'pharmacist' ? pharmacistStats : getCustomerStats()

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPrescriptionFile(file)
      setPrescriptionPreview(URL.createObjectURL(file))
      setPrescriptionMeds([])
      setShowPrescriptionTable(false)
    }
  }

  const handleScanPrescription = () => {
    if (!prescriptionFile) return
    setScanning(true)
    setTimeout(() => {
      setPrescriptionMeds([
        { id: 1, name: 'Paracetamol 500mg', qty: 10, days: 5, frequency: '3x daily', price: 25, category: 'Analgesic', stock: 150, expiry: '2027-06-30' },
        { id: 2, name: 'Amoxicillin 500mg', qty: 21, days: 7, frequency: '3x daily', price: 120, category: 'Antibiotic', stock: 45, expiry: '2027-03-15' },
        { id: 3, name: 'Cetirizine 10mg', qty: 10, days: 5, frequency: '2x daily', price: 35, category: 'Antihistamine', stock: 8, expiry: '2027-09-20' },
      ])
      setShowPrescriptionTable(true)
      setScanning(false)
    }, 2500)
  }

  const handleEdit = (med) => {
    setEditingId(med.id)
    setEditValues({ qty: med.qty, days: med.days, frequency: med.frequency })
  }

  const handleSaveEdit = (id) => {
    setPrescriptionMeds(prescriptionMeds.map(m => m.id === id ? { ...m, ...editValues } : m))
    setEditingId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValues({})
  }

  const handleRemoveMed = (id) => {
    setPrescriptionMeds(prescriptionMeds.filter(m => m.id !== id))
  }

  const handleAddMed = () => {
    const newId = Math.max(...prescriptionMeds.map(m => m.id), 0) + 1
    setPrescriptionMeds([...prescriptionMeds, {
      id: newId, name: '', qty: 1, days: 1, frequency: '1x daily', price: 0, category: '', stock: 0, expiry: '', isNew: true,
    }])
    setEditingId(newId)
    setEditValues({ name: '', qty: 1, days: 1, frequency: '1x daily' })
  }

  const prescriptionTotal = prescriptionMeds.reduce((sum, m) => sum + (m.qty * m.price), 0)

  const handlePlaceOrder = () => {
    if (prescriptionMeds.length === 0 || !patientName.trim()) return
    const order = {
      id: Date.now(),
      patient: patientName.trim(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: 'pending',
      medicines: prescriptionMeds.map(m => ({ name: m.name, qty: m.qty, days: m.days, frequency: m.frequency })),
      total: prescriptionTotal,
    }
    const orders = JSON.parse(localStorage.getItem('pharmashop_prescriptions') || '[]')
    orders.unshift(order)
    localStorage.setItem('pharmashop_prescriptions', JSON.stringify(orders))
    setShowOrderSuccess(true)
    setTimeout(() => {
      setShowOrderSuccess(false)
      setPrescriptionFile(null)
      setPrescriptionPreview(null)
      setPrescriptionMeds([])
      setShowPrescriptionTable(false)
      setPatientName('')
    }, 2000)
  }

  return (
    <div className="dashboard">
      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-content">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
              {stat.change && (
                <span className={`stat-change ${stat.up ? 'positive' : 'negative'}`}>
                  {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Prescription Upload */}
      <div className="dashboard-grid">
        {currentRole === 'customer' && (
          <div className="card">
            <h3 className="card-title">
              <FileText size={18} style={{ color: 'var(--primary)' }} />
              Upload Prescription
            </h3>
            <div className="rx-patient-field">
              <label>Patient Name</label>
              <input
                type="text"
                placeholder="Enter patient name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="rx-patient-input"
              />
            </div>
            <div
              className="upload-zone"
              style={{ minHeight: '180px' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {prescriptionPreview ? (
                <img src={prescriptionPreview} alt="Prescription" className="upload-preview" />
              ) : (
                <>
                  <Upload size={36} className="upload-icon" />
                  <p>Click to upload prescription image</p>
                  <span className="upload-hint">JPG, PNG, HEIC supported</span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                hidden
              />
            </div>
            {prescriptionFile && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button className="btn btn-primary" onClick={handleScanPrescription} disabled={scanning} style={{ flex: 1 }}>
                  <ScanLine size={18} />
                  {scanning ? 'Scanning...' : 'Scan Prescription'}
                </button>
                <button className="btn btn-outline" onClick={() => { setPrescriptionFile(null); setPrescriptionPreview(null); setPrescriptionMeds([]); setShowPrescriptionTable(false) }}>
                  <X size={16} /> Clear
                </button>
              </div>
            )}
          </div>
        )}

        {currentRole !== 'customer' && (
          <div className="card">
            <h3 className="card-title">
              <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
              Weekly Sales
            </h3>
            <div className="chart-container">
              <Bar data={salesChartData} options={salesChartOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Prescription Table (customer only) */}
      {currentRole === 'customer' && showPrescriptionTable && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 className="card-title" style={{ marginBottom: 0 }}>
              <CheckCircle size={18} style={{ color: 'var(--success)' }} />
              Prescription Medicines ({prescriptionMeds.length} items)
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button className="btn btn-primary" onClick={handleAddMed}>
                <Plus size={16} /> Add
              </button>
              {!patientName.trim() && (
                <span style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>
                  Enter patient name
                </span>
              )}
              <button className="btn btn-outline" onClick={handlePlaceOrder} disabled={!patientName.trim()} style={{ opacity: patientName.trim() ? 1 : 0.5 }}>
                <ShoppingCart size={16} /> Place Order
              </button>
            </div>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Days</th>
                  <th>Frequency</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptionMeds.map((med, index) => (
                  <tr key={med.id}>
                    <td>{index + 1}</td>
                    <td>
                      {editingId === med.id ? (
                        <input type="text" value={editValues.name ?? med.name} onChange={(e) => setEditValues({ ...editValues, name: e.target.value })} className="inline-edit" placeholder="Medicine name" />
                      ) : (
                        <div className="medicine-cell">
                          <img {...getMedicineImageWithFallback(med.name)} alt={med.name} className="medicine-thumb" />
                          <span className="medicine-name">{med.name}</span>
                        </div>
                      )}
                    </td>
                    <td><span className="category-badge">{med.category}</span></td>
                    <td>
                      {editingId === med.id ? (
                        <input type="number" value={editValues.qty} onChange={(e) => setEditValues({ ...editValues, qty: parseInt(e.target.value) || 0 })} className="inline-edit inline-edit-sm" min="1" />
                      ) : (
                        <span className="stock-badge in-stock">{med.qty}</span>
                      )}
                    </td>
                    <td>
                      {editingId === med.id ? (
                        <input type="number" value={editValues.days} onChange={(e) => setEditValues({ ...editValues, days: parseInt(e.target.value) || 0 })} className="inline-edit inline-edit-sm" min="1" />
                      ) : med.days}
                    </td>
                    <td>
                      {editingId === med.id ? (
                        <select value={editValues.frequency} onChange={(e) => setEditValues({ ...editValues, frequency: e.target.value })} className="inline-edit inline-edit-sm">
                          <option>1x daily</option>
                          <option>2x daily</option>
                          <option>3x daily</option>
                          <option>As needed</option>
                        </select>
                      ) : med.frequency}
                    </td>
                    <td className="price-cell">NPR {med.price}</td>
                    <td className="price-cell">NPR {med.qty * med.price}</td>
                    <td>
                      <div className="action-btns">
                        {editingId === med.id ? (
                          <>
                            <button className="icon-btn" title="Save" onClick={() => handleSaveEdit(med.id)}>
                              <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                            </button>
                            <button className="icon-btn danger" title="Cancel" onClick={handleCancelEdit}>
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="icon-btn" title="Edit" onClick={() => handleEdit(med)}>
                              <Edit3 size={16} />
                            </button>
                            <button className="icon-btn danger" title="Remove" onClick={() => handleRemoveMed(med.id)}>
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="7" style={{ textAlign: 'right', fontWeight: 600, borderBottom: 'none' }}>Total:</td>
                  <td className="price-cell" style={{ fontSize: '1.1rem', color: 'var(--primary)', borderBottom: 'none' }}>NPR {prescriptionTotal}</td>
                  <td style={{ borderBottom: 'none' }}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Row: Expiry + Top Selling */}
      <div className="dashboard-grid">
        {currentRole !== 'customer' && (
          <div className="card">
            <h3 className="card-title">
              <Clock size={18} style={{ color: 'var(--warning)' }} />
              Expiring Soon
            </h3>
            <div className="expiry-list">
              {expiryItems.map((item) => (
                <div key={item.name} className="expiry-item">
                  <span className="expiry-name">{item.name}</span>
                  <span className="expiry-date">{item.expiry}</span>
                  <span className={`expiry-days ${item.days < 60 ? 'urgent' : ''}`}>{item.days} days</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <h3 className="card-title">
            <Zap size={18} style={{ color: 'var(--primary)' }} />
            Top Selling
          </h3>
          <div className="top-list">
            {topSelling.map((item, i) => (
              <div key={item.name} className="top-item">
                <span className="top-rank">#{i + 1}</span>
                <img {...getMedicineImageWithFallback(item.name)} alt={item.name} className="top-thumb" />
                <div className="top-info">
                  <span className="top-name">{item.name}</span>
                  <span className="top-sold">{item.sold} units sold</span>
                </div>
                <span className="top-revenue">{item.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Success Modal */}
      {showOrderSuccess && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
              <CheckCircle size={28} />
            </div>
            <h3>Order Placed Successfully!</h3>
            <p>Your prescription order of NPR {prescriptionTotal} has been placed. You will be notified once reviewed.</p>
          </div>
        </div>
      )}
    </div>
  )
}
