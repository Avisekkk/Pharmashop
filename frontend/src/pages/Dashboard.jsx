import { useState, useEffect } from 'react'
import {
  Package, AlertTriangle, TrendingUp, DollarSign,
  ShoppingCart, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement, PointElement, LineElement
} from 'chart.js'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title,
  Tooltip, Legend, ArcElement, PointElement, LineElement
)

const statsData = [
  { label: 'Total Medicines', value: '1,247', change: '+12%', up: true, icon: Package, color: '#059669' },
  { label: 'Low Stock Alerts', value: '23', change: '+5%', up: false, icon: AlertTriangle, color: '#f59e0b' },
  { label: 'Monthly Sales', value: '₹2,45,800', change: '+18%', up: true, icon: TrendingUp, color: '#6366f1' },
  { label: 'Today\'s Revenue', value: '₹12,450', change: '+8%', up: true, icon: DollarSign, color: '#0284c7' },
]

const recentMedicines = [
  { name: 'Paracetamol 500mg', category: 'Analgesic', stock: 150, price: 25, status: 'in-stock' },
  { name: 'Amoxicillin 500mg', category: 'Antibiotic', stock: 45, price: 120, status: 'in-stock' },
  { name: 'Cetirizine 10mg', category: 'Antihistamine', stock: 8, price: 35, status: 'low-stock' },
  { name: 'Metformin 500mg', category: 'Antidiabetic', stock: 200, price: 45, status: 'in-stock' },
  { name: 'Amlodipine 5mg', category: 'Antihypertensive', stock: 3, price: 55, status: 'critical' },
  { name: 'Omeprazole 20mg', category: 'Antacid', stock: 80, price: 65, status: 'in-stock' },
]

const salesChartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Sales (₹)',
      data: [12400, 15600, 11200, 18900, 16700, 22300, 14500],
      backgroundColor: 'rgba(5, 150, 105, 0.8)',
      borderRadius: 8,
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
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#f1f5f9' },
      ticks: { color: '#94a3b8' },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#94a3b8' },
    },
  },
}

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="stats-grid">
        {statsData.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: stat.color + '15', color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
              <span className={`stat-change ${stat.up ? 'positive' : 'negative'}`}>
                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card chart-card">
          <h3 className="card-title">Weekly Sales Overview</h3>
          <div className="chart-container">
            <Bar data={salesChartData} options={salesChartOptions} />
          </div>
        </div>

        <div className="card recent-card">
          <h3 className="card-title">Recent Medicines</h3>
          <div className="recent-list">
            {recentMedicines.map((med) => (
              <div key={med.name} className="recent-item">
                <div className="recent-info">
                  <span className="recent-name">{med.name}</span>
                  <span className="recent-category">{med.category}</span>
                </div>
                <div className="recent-meta">
                  <span className="recent-price">₹{med.price}</span>
                  <span className={`stock-badge ${med.status}`}>
                    {med.stock} units
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card expiry-card">
          <h3 className="card-title">
            <Clock size={18} /> Expiring Soon
          </h3>
          <div className="expiry-list">
            {[
              { name: 'Aspirin 75mg', expiry: '2026-10-15', days: 32 },
              { name: 'Vitamin D3', expiry: '2026-11-20', days: 68 },
              { name: 'Iron Supplement', expiry: '2026-12-01', days: 79 },
            ].map((item) => (
              <div key={item.name} className="expiry-item">
                <span className="expiry-name">{item.name}</span>
                <span className="expiry-date">{item.expiry}</span>
                <span className={`expiry-days ${item.days < 60 ? 'urgent' : ''}`}>
                  {item.days} days
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card top-selling-card">
          <h3 className="card-title">
            <TrendingUp size={18} /> Top Selling
          </h3>
          <div className="top-list">
            {[
              { name: 'Paracetamol 500mg', sold: 342, revenue: '₹8,550' },
              { name: 'Amoxicillin 500mg', sold: 218, revenue: '₹26,160' },
              { name: 'Cetirizine 10mg', sold: 185, revenue: '₹6,475' },
            ].map((item, i) => (
              <div key={item.name} className="top-item">
                <span className="top-rank">#{i + 1}</span>
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
    </div>
  )
}
