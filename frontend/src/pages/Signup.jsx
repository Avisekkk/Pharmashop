import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Signup({ onSignup, onSwitchToLogin }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name || !phone || !username || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }
    if (/\d/.test(name)) {
      setError('Full name cannot contain numbers')
      return
    }
    if (!/^\d{10,}$/.test(phone)) {
      setError('Phone number must be at least 10 digits')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const users = JSON.parse(localStorage.getItem('pharmashop_users') || '[]')

    if (users.find((u) => u.username === username)) {
      setError('Username already taken')
      return
    }

    const newUser = { name, phone, username, password, role: 'customer' }
    users.push(newUser)
    localStorage.setItem('pharmashop_users', JSON.stringify(users))
    localStorage.setItem('pharmashop_current_user', JSON.stringify(newUser))
    onSignup()
  }

  const handleNameChange = (e) => {
    const val = e.target.value
    if (/\d/.test(val)) {
      setError('Full name cannot contain numbers')
      return
    }
    setName(val)
    setError('')
  }

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '')
    setPhone(val)
    setError('')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <h1>PharmaShop</h1>
          <p>Create your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          <div className="login-field">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={handleNameChange}
            />
          </div>
          <div className="login-field">
            <label>Phone Number</label>
            <input
              type="text"
              placeholder="Enter 10-digit phone number"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={15}
            />
          </div>
          <div className="login-field">
            <label>Username</label>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError('') }}
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <div className="login-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="login-field">
            <label>Confirm Password</label>
            <div className="login-password-wrapper">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="login-btn">
            Sign Up
          </button>
        </form>
        <p className="login-switch">
          Already have an account?{' '}
          <button className="login-switch-btn" onClick={onSwitchToLogin}>
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}
