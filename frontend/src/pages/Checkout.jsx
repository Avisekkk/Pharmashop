import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  ArrowLeft, ShoppingCart, CheckCircle, FileText, CreditCard,
  Wallet, Building2, Banknote
} from 'lucide-react'
import { getMedicineImageWithFallback } from '../medicineImages'
import { getItemPrice, getItemTotal } from '../medicineCatalog'
import { addNotification } from '../notifications'

const paymentMethods = [
  { id: 'cod', label: 'Cash on Delivery', description: 'Pay when your order is delivered', icon: Banknote },
  { id: 'esewa', label: 'eSewa', description: 'Pay via eSewa digital wallet', icon: Wallet },
  { id: 'khalti', label: 'Khalti', description: 'Pay via Khalti digital wallet', icon: Wallet },
  { id: 'bank', label: 'Bank Transfer', description: 'Transfer directly to our bank account', icon: Building2 },
]

const saveOrder = (order) => {
  const orders = JSON.parse(localStorage.getItem('pharmashop_orders') || '[]')
  localStorage.setItem('pharmashop_orders', JSON.stringify([order, ...orders]))
}

export default function Checkout({ cart, setCart }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [orderPlaced, setOrderPlaced] = useState(false)

  const cartData = location.state?.cart || cart
  const cartTotal = location.state?.cartTotal || cart.reduce((sum, c) => sum + getItemTotal(c), 0)
  const cartGroups = location.state?.cartGroups || buildGroups(cartData)

  if (!cartData || cartData.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <ShoppingCart size={48} />
          <h2>Your cart is empty</h2>
          <p>Add medicines to your cart to proceed to checkout.</p>
          <Link to="/" className="shop-btn shop-btn-buy" style={{ textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="checkout-success">
          <CheckCircle size={64} />
          <h2>Order Placed Successfully!</h2>
          <p>Your order has been placed and is awaiting pharmacist review.</p>
          <p className="checkout-success-id">Order #{Date.now()}</p>
          <div className="checkout-success-actions">
            <Link to="/my-orders" className="shop-btn shop-btn-buy" style={{ textDecoration: 'none' }}>
              View My Orders
            </Link>
            <Link to="/" className="shop-btn shop-btn-outline" style={{ textDecoration: 'none' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handlePlaceOrder = () => {
    const rxItems = cartData.filter(c => c.prescriptionId)
    const primaryRx = rxItems.length > 0 ? rxItems[0] : null

    const order = {
      id: Date.now(),
      patient: primaryRx?.patientName || 'Walk-in',
      doctorName: primaryRx?.doctorName || '',
      prescriptionId: primaryRx?.prescriptionId || null,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: 'pending',
      paymentMethod,
      medicines: cartData.map(c => ({
        name: c.name,
        qty: c.qty,
        price: getItemPrice(c),
        dosage: c.dosage || '',
        frequency: c.frequency || '',
        notes: c.notes || '',
      })),
      total: cartTotal,
    }

    saveOrder(order)

    addNotification({
      title: 'New Order',
      message: `Order #${order.id} from ${order.patient} - NPR ${order.total} (${paymentMethods.find(p => p.id === paymentMethod)?.label || paymentMethod})`,
      roles: ['admin', 'pharmacist'],
      type: 'order',
    })

    if (order.prescriptionId) {
      addNotification({
        title: 'Prescription Order',
        message: `Order #${order.id} placed from prescription for ${order.patient}`,
        roles: ['admin', 'pharmacist'],
        type: 'prescription',
      })
    }

    setCart([])
    setOrderPlaced(true)
  }

  return (
    <div className="checkout-page">
      <div className="checkout-topbar">
        <button className="checkout-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1>Checkout</h1>
        <div style={{ width: 80 }} />
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          <div className="checkout-section">
            <h2><ShoppingCart size={18} /> Order Summary</h2>

            {cartGroups.map((group, gi) => (
              <div key={gi} className="checkout-group">
                {group.prescriptionId !== null && (
                  <div className="checkout-rx-info">
                    <div className="checkout-rx-info-top">
                      <FileText size={14} />
                      <span>Prescription Order</span>
                    </div>
                    <div className="checkout-rx-meta">
                      {group.doctorName && <span>Dr. {group.doctorName}</span>}
                      {group.patientName && <span>{group.patientName}</span>}
                      {group.prescriptionDate && <span>{group.prescriptionDate}</span>}
                    </div>
                  </div>
                )}

                <table className="checkout-items-table">
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Details</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map(item => (
                      <tr key={item.id}>
                        <td className="checkout-item-name">
                          <img {...getMedicineImageWithFallback(item.name)} alt={item.name} className="checkout-item-img" />
                          <span>
                            {item.name}
                            {item.prescription_required && <span className="rx-badge">Rx</span>}
                          </span>
                        </td>
                        <td className="checkout-item-details">
                          {item.dosage && <span>{item.dosage}</span>}
                          {item.frequency && <span>{item.frequency}</span>}
                          {item.notes && <span>{item.notes}</span>}
                          {!item.dosage && !item.frequency && !item.notes && <span>-</span>}
                        </td>
                        <td>{item.qty}</td>
                        <td>NPR {getItemPrice(item)}</td>
                        <td className="checkout-item-total">NPR {getItemTotal(item)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div className="checkout-section">
            <h2><CreditCard size={18} /> Payment Method</h2>
            <div className="checkout-payment-grid">
              {paymentMethods.map(method => {
                const Icon = method.icon
                return (
                  <button
                    key={method.id}
                    className={`checkout-payment-card ${paymentMethod === method.id ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <Icon size={24} />
                    <span className="checkout-payment-label">{method.label}</span>
                    <span className="checkout-payment-desc">{method.description}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="checkout-sidebar">
          <div className="checkout-summary-card">
            <h3>Order Total</h3>
            <div className="checkout-summary-rows">
              <div className="checkout-summary-row">
                <span>Items ({cartData.reduce((sum, c) => sum + c.qty, 0)})</span>
                <span>NPR {cartTotal}</span>
              </div>
              <div className="checkout-summary-row">
                <span>Delivery</span>
                <span className="checkout-free">Free</span>
              </div>
              <div className="checkout-summary-divider" />
              <div className="checkout-summary-row checkout-summary-total">
                <span>Total</span>
                <span>NPR {cartTotal}</span>
              </div>
            </div>
            <div className="checkout-summary-payment">
              <span className="checkout-summary-payment-label">Payment:</span>
              <span>{paymentMethods.find(p => p.id === paymentMethod)?.label}</span>
            </div>
            <button className="shop-btn shop-btn-buy checkout-place-btn" onClick={handlePlaceOrder}>
              <CheckCircle size={18} /> Place Order — NPR {cartTotal}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function buildGroups(cart) {
  const groups = []
  const rxMap = {}
  cart.forEach(item => {
    if (item.prescriptionId) {
      if (!rxMap[item.prescriptionId]) {
        rxMap[item.prescriptionId] = {
          prescriptionId: item.prescriptionId,
          doctorName: item.doctorName || '',
          patientName: item.patientName || '',
          prescriptionDate: item.prescriptionDate || '',
          items: [],
        }
        groups.push(rxMap[item.prescriptionId])
      }
      rxMap[item.prescriptionId].items.push(item)
    } else {
      let regularGroup = groups.find(g => g.prescriptionId === null)
      if (!regularGroup) {
        regularGroup = { prescriptionId: null, items: [] }
        groups.unshift(regularGroup)
      }
      regularGroup.items.push(item)
    }
  })
  return groups
}
