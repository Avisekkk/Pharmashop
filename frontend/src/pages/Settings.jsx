import { useState } from 'react'
import { Settings as SettingsIcon, User, Shield, Bell, Save, Database, Globe, Key } from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    pharmacyName: 'PharmaShop',
    address: '123 Medical Lane, Health City',
    phone: '+91 98765 43210',
    email: 'admin@pharmashop.com',
    lowStockThreshold: 20,
    expiryWarningDays: 60,
    autoReorder: true,
    emailNotifications: true,
    smsNotifications: false,
  })

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p className="page-subtitle">Manage your pharmacy settings</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar card">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="settings-content card">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>Pharmacy Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Pharmacy Name</label>
                  <input type="text" value={settings.pharmacyName} onChange={(e) => setSettings({ ...settings, pharmacyName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
                </div>
              </div>
              <h3 style={{ marginTop: '1.5rem' }}>Inventory Thresholds</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Low Stock Threshold</label>
                  <input type="number" value={settings.lowStockThreshold} onChange={(e) => setSettings({ ...settings, lowStockThreshold: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Expiry Warning (Days)</label>
                  <input type="number" value={settings.expiryWarningDays} onChange={(e) => setSettings({ ...settings, expiryWarningDays: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3>Notification Preferences</h3>
              <div className="toggle-group">
                <label className="toggle-label">
                  <span>Low Stock Alerts</span>
                  <input type="checkbox" checked={settings.autoReorder} onChange={(e) => setSettings({ ...settings, autoReorder: e.target.checked })} />
                  <span className="toggle-slider"></span>
                </label>
                <label className="toggle-label">
                  <span>Email Notifications</span>
                  <input type="checkbox" checked={settings.emailNotifications} onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })} />
                  <span className="toggle-slider"></span>
                </label>
                <label className="toggle-label">
                  <span>SMS Notifications</span>
                  <input type="checkbox" checked={settings.smsNotifications} onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="settings-section">
              <h3>User Profile</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" defaultValue="Admin User" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" defaultValue="admin@pharmashop.com" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" defaultValue="+91 98765 43210" />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input type="text" value="Administrator" disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h3>Change Password</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" placeholder="Enter current password" />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" placeholder="Enter new password" />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" placeholder="Confirm new password" />
                </div>
              </div>
            </div>
          )}

          <div className="settings-footer">
            <button className="btn btn-primary">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
