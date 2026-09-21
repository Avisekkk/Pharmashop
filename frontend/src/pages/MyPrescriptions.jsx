import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Clock, CheckCircle, XCircle, FileText, Upload, X, Plus,
  Trash2, Loader2, Sparkles, ShoppingCart, Trash
} from 'lucide-react'
import { scanPrescription, isGeminiConfigured } from '../services/gemini'
import { getItemPrice } from '../medicineCatalog'
import { addNotification } from '../notifications'

const getStoredPrescriptions = () => {
  try { return JSON.parse(localStorage.getItem('pharmashop_prescriptions') || '[]') }
  catch { return [] }
}

const savePrescriptions = (list) => {
  localStorage.setItem('pharmashop_prescriptions', JSON.stringify(list))
}

const saveOrder = (order) => {
  const orders = JSON.parse(localStorage.getItem('pharmashop_orders') || '[]')
  localStorage.setItem('pharmashop_orders', JSON.stringify([order, ...orders]))
}

const emptyMedRow = () => ({ name: '', dosage: '', quantity: 1, frequency: '', notes: '' })

const inventoryMedicines = [
  { name: 'Paracetamol 500mg', dosage: '500mg' },
  { name: 'Amoxicillin 500mg', dosage: '500mg' },
  { name: 'Cetirizine 10mg', dosage: '10mg' },
  { name: 'Metformin 500mg', dosage: '500mg' },
  { name: 'Omeprazole 20mg', dosage: '20mg' },
  { name: 'Azithromycin 500mg', dosage: '500mg' },
  { name: 'Vitamin C 500mg', dosage: '500mg' },
  { name: 'Ciprofloxacin 500mg', dosage: '500mg' },
  { name: 'Pantoprazole 40mg', dosage: '40mg' },
  { name: 'Amlodipine 5mg', dosage: '5mg' },
  { name: 'Montelukast 10mg', dosage: '10mg' },
  { name: 'Metronidazole 400mg', dosage: '400mg' },
]

export default function MyPrescriptions({ cart, setCart, setShowCart }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [prescriptions, setPrescriptions] = useState([])
  const [showUpload, setShowUpload] = useState(false)
  const [viewImage, setViewImage] = useState(null)
  const [form, setForm] = useState({ image: null, imagePreview: null })
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState(null)
  const [activeRxId, setActiveRxId] = useState(null)
  const [orderMedicines, setOrderMedicines] = useState([])
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(null)
  const [suggestionPos, setSuggestionPos] = useState({ top: 0, left: 0, width: 0 })
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    setPrescriptions(getStoredPrescriptions())
  }, [])

  useEffect(() => {
    if (searchParams.get('upload') === 'true') {
      setShowUpload(true)
      const next = new URLSearchParams(searchParams)
      next.delete('upload')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    const handleClickOutside = (e) => {
      const inInput = inputRef.current && inputRef.current.contains(e.target)
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target)
      if (!inInput && !inDropdown) {
        setActiveSuggestionIdx(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showSuggestions = (idx, el) => {
    if (el) {
      const rect = el.getBoundingClientRect()
      setSuggestionPos({ top: rect.bottom + 2, left: rect.left, width: rect.width })
    }
    setActiveSuggestionIdx(idx)
  }

  const selectSuggestion = (idx, med) => {
    updateMed(idx, 'name', med.name)
    updateMed(idx, 'dosage', med.dosage)
    setActiveSuggestionIdx(null)
  }

  const statusColor = (status) => {
    if (status === 'pending') return 'var(--warning)'
    if (status === 'approved') return 'var(--success)'
    return 'var(--danger)'
  }

  const statusBg = (status) => {
    if (status === 'pending') return 'var(--warning-light)'
    if (status === 'approved') return 'var(--success-light)'
    return 'var(--danger-light)'
  }

  const statusIcon = (status) => {
    if (status === 'pending') return <Clock size={14} />
    if (status === 'approved') return <CheckCircle size={14} />
    return <XCircle size={14} />
  }

  const removePrescription = (id) => {
    const updated = prescriptions.filter((p) => p.id !== id)
    savePrescriptions(updated)
    setPrescriptions(updated)
    if (activeRxId === id) {
      setActiveRxId(null)
      setOrderMedicines([])
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm({ ...form, image: file, imagePreview: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!form.imagePreview) return

    const rx = {
      id: Date.now(),
      doctorName: '',
      patientName: '',
      image: form.imagePreview,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: 'pending',
      medicines: [],
    }

    const updated = [rx, ...prescriptions]
    savePrescriptions(updated)
    setPrescriptions(updated)
    setForm({ image: null, imagePreview: null })
    setShowUpload(false)

    if (form.imagePreview && isGeminiConfigured()) {
      setActiveRxId(rx.id)
      setScanning(true)
      setScanError(null)
      setOrderMedicines([emptyMedRow()])
      setOrderPlaced(false)

      try {
        const extracted = await scanPrescription(form.imagePreview)
        const updatedRx = {
          ...rx,
          patientName: extracted.patientName || '',
          doctorName: extracted.doctorName || '',
        }
        const updatedList = updated.map((p) => p.id === rx.id ? updatedRx : p)
        savePrescriptions(updatedList)
        setPrescriptions(updatedList)

        if (extracted.medicines.length > 0) {
          setOrderMedicines(extracted.medicines.map((m) => ({
            name: m.name || '',
            dosage: m.dosage || '',
            quantity: 1,
            frequency: m.frequency || '',
            notes: m.notes || '',
          })))
          const updatedWithMeds = updatedList.map((p) =>
            p.id === rx.id
              ? { ...p, medicines: extracted.medicines.map((m) => ({
                  name: m.name || '',
                  dosage: m.dosage || '',
                  frequency: m.frequency || '',
                  notes: m.notes || '',
                })) }
              : p
          )
          savePrescriptions(updatedWithMeds)
          setPrescriptions(updatedWithMeds)
        } else {
          setScanError('No medicines detected. You can add them manually below.')
        }
      } catch (err) {
        setScanError(err?.message || 'AI scan failed. You can add medicines manually below.')
      } finally {
        setScanning(false)
      }
    } else if (form.imagePreview && !isGeminiConfigured()) {
      setActiveRxId(rx.id)
      setOrderMedicines([emptyMedRow()])
      setScanError('AI scanning not configured. Add medicines manually.')
      setOrderPlaced(false)
    }
  }

  const updateMed = (index, field, value) => {
    setOrderMedicines(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  const removeMed = (index) => {
    setOrderMedicines(orderMedicines.filter((_, i) => i !== index))
  }

  const addMed = () => {
    setOrderMedicines([...orderMedicines, emptyMedRow()])
  }

  const addToCart = () => {
    const validMeds = orderMedicines.filter((m) => m.name.trim())
    if (validMeds.length === 0) return

    const rx = prescriptions.find((p) => p.id === activeRxId)

    const newItems = validMeds.map((m, i) => {
      return {
        id: `rx-${activeRxId}-${Date.now()}-${i}`,
        name: m.name,
        dosage: m.dosage || '',
        qty: parseInt(m.quantity) || 1,
        frequency: m.frequency || '',
        notes: m.notes || '',
        price: getItemPrice({ name: m.name }),
        prescription_required: true,
        prescriptionId: activeRxId,
        doctorName: rx?.doctorName || '',
        patientName: rx?.patientName || '',
        prescriptionDate: rx?.date || '',
      }
    })

    const updatedCart = [...(cart || []), ...newItems]
    setCart(updatedCart)

    const updatedRx = prescriptions.map((p) =>
      p.id === activeRxId ? { ...p, medicines: validMeds.map((m) => ({
        name: m.name,
        dosage: m.dosage || '',
        frequency: m.frequency || '',
        notes: m.notes || '',
      })) } : p
    )
    savePrescriptions(updatedRx)
    setPrescriptions(updatedRx)

    addNotification({
      title: 'Added to Cart',
      message: `${validMeds.length} medicine${validMeds.length > 1 ? 's' : ''} from Rx #${String(activeRxId).slice(-6)} added to cart`,
      roles: ['admin', 'pharmacist'],
      type: 'order',
    })

    setOrderPlaced(true)
    setTimeout(() => {
      setActiveRxId(null)
      setOrderMedicines([])
      setOrderPlaced(false)
      navigate('/?cart=open')
    }, 800)
  }

  const startOrderForRx = (rx) => {
    setActiveRxId(rx.id)
    setOrderMedicines(rx.medicines && rx.medicines.length > 0
      ? rx.medicines.map((m) => typeof m === 'string'
        ? { name: m, dosage: '', quantity: 1, frequency: '', notes: '' }
        : { name: m.name || '', dosage: m.dosage || '', quantity: m.quantity || 1, frequency: m.frequency || '', notes: m.notes || '' }
      )
      : [emptyMedRow()]
    )
    setScanError(null)
    setOrderPlaced(false)
    if (isGeminiConfigured() && rx.image && (!rx.medicines || rx.medicines.length === 0)) {
      runAiScan(rx)
    }
  }

  const runAiScan = async (rx) => {
    setScanning(true)
    setScanError(null)
    try {
      const extracted = await scanPrescription(rx.image)
      const updatedRx = {
        ...rx,
        patientName: extracted.patientName || rx.patientName || '',
        doctorName: extracted.doctorName || rx.doctorName || '',
      }
      const updatedList = prescriptions.map((p) => p.id === rx.id ? updatedRx : p)

      if (extracted.medicines.length > 0) {
        const updatedWithMeds = updatedList.map((p) =>
          p.id === rx.id
            ? { ...p, medicines: extracted.medicines.map((m) => ({
                name: m.name || '',
                dosage: m.dosage || '',
                frequency: m.frequency || '',
                notes: m.notes || '',
              })) }
            : p
        )
        savePrescriptions(updatedWithMeds)
        setPrescriptions(updatedWithMeds)

        setOrderMedicines(extracted.medicines.map((m) => ({
          name: m.name || '',
          dosage: m.dosage || '',
          quantity: 1,
          frequency: m.frequency || '',
          notes: m.notes || '',
        })))
      } else {
        savePrescriptions(updatedList)
        setPrescriptions(updatedList)
        setScanError('No medicines detected. Add them manually.')
      }
    } catch (err) {
      setScanError(err?.message || 'AI scan failed. Add medicines manually.')
    } finally {
      setScanning(false)
    }
  }

  const orderTotal = orderMedicines.reduce((sum, m) => sum + (parseInt(m.quantity) || 0), 0)

  return (
    <div className="my-prescriptions">
      <div className="page-header">
        <div>
          <h2>My Prescriptions</h2>
          <p className="page-subtitle">{prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {prescriptions.length === 0 && !showUpload ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FileText size={48} />
          </div>
          <h3>No prescriptions yet</h3>
          <p>Upload a prescription from your doctor to get started with your orders.</p>
          <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
            <Upload size={18} /> Upload Prescription
          </button>
        </div>
      ) : (
        <div className="my-rx-list">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="my-rx-card">
              <div className="my-rx-header">
                <div className="my-rx-id">
                  <span>Rx #{String(rx.id).slice(-6)}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {activeRxId !== rx.id && (
                    <button className="btn btn-primary btn-sm" onClick={() => startOrderForRx(rx)}>
                      <ShoppingCart size={14} /> Add to Cart
                    </button>
                  )}
                  <button className="rx-table-remove" onClick={() => removePrescription(rx.id)} title="Delete prescription">
                    <Trash size={14} />
                  </button>
                  <span className="rx-status" style={{ background: statusBg(rx.status), color: statusColor(rx.status) }}>
                    {statusIcon(rx.status)}
                    {rx.status.charAt(0).toUpperCase() + rx.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="my-rx-body">
                <div className="my-rx-meta">
                  <span className="my-rx-date">{rx.date} at {rx.time}</span>
                  {rx.doctorName && <span className="my-rx-patient">Dr. {rx.doctorName}</span>}
                  {rx.patientName && <span className="my-rx-patient">{rx.patientName}</span>}
                </div>

                {rx.medicines && rx.medicines.length > 0 && (
                  <div className="my-rx-meds">
                    <span className="my-rx-meds-title">Medicines ({rx.medicines.length})</span>
                    <table className="my-rx-meds-table">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rx.medicines.map((med, i) => (
                          <tr key={i}>
                            <td>{typeof med === 'string' ? med : med.name}</td>
                            <td>{typeof med === 'object' && med.dosage ? med.dosage : '-'}</td>
                            <td>{typeof med === 'object' && med.frequency ? med.frequency : '-'}</td>
                            <td>{typeof med === 'object' && med.notes ? med.notes : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {rx.image && (
                  <div className="my-rx-image-section">
                    <span className="my-rx-meds-title">Prescription Image</span>
                    <img
                      src={rx.image}
                      alt="Prescription"
                      className="my-rx-image"
                      onClick={() => setViewImage(rx.image)}
                    />
                  </div>
                )}

                {activeRxId === rx.id && (
                  <div className="rx-order-section">
                    <div className="rx-order-header">
                      <Sparkles size={18} />
                      <h3>{prescriptions.find((p) => p.id === activeRxId)?.medicines?.length > 0 ? 'Edit Medicines' : 'Add Medicines to Cart'}</h3>
                    </div>

                    {scanning && (
                      <div className="rx-scanning">
                        <Loader2 size={24} className="rx-scanning-spinner" />
                        <span>Analyzing prescription with AI...</span>
                      </div>
                    )}

                    {scanError && (
                      <div className="rx-scan-error">
                        <span>{scanError}</span>
                        {!isGeminiConfigured() && (
                          <span className="rx-scan-hint">Set VITE_GEMINI_API_KEY in .env for AI scanning</span>
                        )}
                      </div>
                    )}

                    <div className="rx-order-table-wrapper">
                      <table className="rx-order-table">
                        <thead>
                          <tr>
                            <th>Medicine</th>
                            <th>Dosage</th>
                            <th>Qty</th>
                            <th>Frequency</th>
                            <th>Notes</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderMedicines.map((med, idx) => {
                            const filtered = med.name.trim().length > 0
                              ? inventoryMedicines.filter((m) => m.name.toLowerCase().includes(med.name.toLowerCase()))
                              : []
                            return (
                            <tr key={idx}>
                              <td className="rx-suggestion-cell">
                                <input
                                  ref={activeSuggestionIdx === idx ? inputRef : null}
                                  type="text"
                                  value={med.name}
                                  onChange={(e) => {
                                    updateMed(idx, 'name', e.target.value)
                                    if (e.target.value.trim().length > 0) {
                                      showSuggestions(idx, e.target)
                                    } else {
                                      setActiveSuggestionIdx(null)
                                    }
                                  }}
                                  onFocus={(e) => { if (med.name.trim().length > 0) showSuggestions(idx, e.target) }}
                                  placeholder="Medicine name"
                                />
                                {activeSuggestionIdx === idx && filtered.length > 0 && (
                                  <div ref={dropdownRef} className="rx-suggestions" style={{ top: suggestionPos.top, left: suggestionPos.left, width: suggestionPos.width }}>
                                    {filtered.map((m, si) => (
                                      <div
                                        key={si}
                                        className="rx-suggestion-item"
                                        onMouseDown={() => selectSuggestion(idx, m)}
                                      >
                                        {m.name}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={med.dosage}
                                  onChange={(e) => updateMed(idx, 'dosage', e.target.value)}
                                  placeholder="e.g. 500mg"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min="1"
                                  value={med.quantity}
                                  onChange={(e) => updateMed(idx, 'quantity', e.target.value)}
                                  className="rx-qty-input"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={med.frequency}
                                  onChange={(e) => updateMed(idx, 'frequency', e.target.value)}
                                  placeholder="e.g. 3x daily"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={med.notes}
                                  onChange={(e) => updateMed(idx, 'notes', e.target.value)}
                                  placeholder="e.g. After meals"
                                />
                              </td>
                              <td>
                                <button className="rx-table-remove" onClick={() => removeMed(idx)} title="Remove">
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                            )})}
                        </tbody>
                      </table>
                    </div>

                    <div className="rx-order-footer">
                      <button className="btn btn-outline btn-sm" onClick={addMed}>
                        <Plus size={14} /> Add Medicine
                      </button>
                      <div className="rx-order-footer-right">
                        <span className="rx-order-count">{orderMedicines.filter((m) => m.name.trim()).length} medicines</span>
                        {orderPlaced ? (
                          <span className="rx-order-success">
                            <CheckCircle size={16} /> Added to Cart!
                          </span>
                        ) : (
                          <button
                            className="btn btn-primary"
                            onClick={addToCart}
                            disabled={orderMedicines.filter((m) => m.name.trim()).length === 0}
                          >
                            <ShoppingCart size={16} /> Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="rx-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rx-modal-header">
              <h3>Upload Prescription</h3>
              <button className="icon-btn" onClick={() => setShowUpload(false)}><X size={18} /></button>
            </div>
            <p className="rx-modal-subtitle">Upload a valid prescription from a licensed doctor. AI will scan and extract medicines, patient name, and doctor name.</p>
            <div className="rx-form">
              <div className="rx-form-group">
                <label>Prescription Image</label>
                <label className="rx-upload-area">
                  {form.imagePreview ? (
                    <img src={form.imagePreview} alt="Prescription" className="rx-preview" />
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
              <button className="btn btn-outline" onClick={() => setShowUpload(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!form.imagePreview}
              >
                {isGeminiConfigured() ? (
                  <><Sparkles size={16} /> Upload & Scan</>
                ) : (
                  'Upload Prescription'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewImage && (
        <div className="modal-overlay" onClick={() => setViewImage(null)} style={{ cursor: 'zoom-out' }}>
          <div className="rx-image-viewer" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn" onClick={() => setViewImage(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
              <X size={20} />
            </button>
            <img src={viewImage} alt="Prescription" />
          </div>
        </div>
      )}
    </div>
  )
}
