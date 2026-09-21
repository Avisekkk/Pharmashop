import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Login({ onLogin, onSwitchToSignup }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Please fill in all fields')
      return
    }

    const users = JSON.parse(localStorage.getItem('pharmashop_users') || '[]')
    const user = users.find((u) => u.username === username && u.password === password)

    if (!user) {
      setError('Invalid username or password')
      return
    }

    localStorage.setItem('pharmashop_current_user', JSON.stringify(user))
    onLogin()
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <h1>PharmaShop</h1>
          <p>Pharmacy Inventory Management System</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          <div className="login-field">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError('') }}
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <div className="login-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
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
          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>
        <p className="login-switch">
          Don't have an account?{' '}
          <button className="login-switch-btn" onClick={onSwitchToSignup}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  )
}
