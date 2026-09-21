import { useState } from 'react'
import {
  BarChart3, Calendar, Receipt
} from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const weeklyData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  revenue: [12400, 15600, 11200, 18900, 16700, 22300, 14500],
  transactions: [18, 24, 16, 28, 22, 35, 20],
  avgSale: [689, 650, 700, 675, 759, 637, 725],
}

const monthlyData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  revenue: [185000, 210000, 195000, 245000, 230000, 275000, 260000, 290000, 310000],
  transactions: [280, 320, 295, 370, 350, 420, 395, 440, 475],
  avgSale: [661, 656, 661, 662, 657, 655, 658, 659, 653],
}

const yearlyData = {
  labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
  revenue: [1800000, 2100000, 2450000, 2800000, 3200000, 3600000],
  transactions: [3200, 3800, 4400, 5100, 5800, 6400],
  avgSale: [563, 553, 557, 549, 552, 563],
}

const weeklySales = [
  { day: 'Monday', date: '2026-09-08', sales: 18, revenue: 12400, top: 'Paracetamol 500mg' },
  { day: 'Tuesday', date: '2026-09-09', sales: 24, revenue: 15600, top: 'Amoxicillin 500mg' },
  { day: 'Wednesday', date: '2026-09-10', sales: 16, revenue: 11200, top: 'Cetirizine 10mg' },
  { day: 'Thursday', date: '2026-09-11', sales: 28, revenue: 18900, top: 'Metformin 500mg' },
  { day: 'Friday', date: '2026-09-12', sales: 22, revenue: 16700, top: 'Amlodipine 5mg' },
  { day: 'Saturday', date: '2026-09-13', sales: 35, revenue: 22300, top: 'Omeprazole 20mg' },
  { day: 'Sunday', date: '2026-09-14', sales: 20, revenue: 14500, top: 'Paracetamol 500mg' },
]

const monthlySales = [
  { month: 'January', period: 'Jan 2026', sales: 280, revenue: 185000, top: 'Amoxicillin 500mg' },
  { month: 'February', period: 'Feb 2026', sales: 320, revenue: 210000, top: 'Paracetamol 500mg' },
  { month: 'March', period: 'Mar 2026', sales: 295, revenue: 195000, top: 'Cetirizine 10mg' },
  { month: 'April', period: 'Apr 2026', sales: 370, revenue: 245000, top: 'Metformin 500mg' },
  { month: 'May', period: 'May 2026', sales: 350, revenue: 230000, top: 'Amlodipine 5mg' },
  { month: 'June', period: 'Jun 2026', sales: 420, revenue: 275000, top: 'Amoxicillin 500mg' },
  { month: 'July', period: 'Jul 2026', sales: 395, revenue: 260000, top: 'Omeprazole 20mg' },
  { month: 'August', period: 'Aug 2026', sales: 440, revenue: 290000, top: 'Paracetamol 500mg' },
  { month: 'September', period: 'Sep 2026', sales: 475, revenue: 310000, top: 'Amoxicillin 500mg' },
]

const yearlySales = [
  { year: '2021', period: 'FY 2021', sales: 3200, revenue: 1800000, top: 'Paracetamol 500mg' },
  { year: '2022', period: 'FY 2022', sales: 3800, revenue: 2100000, top: 'Amoxicillin 500mg' },
  { year: '2023', period: 'FY 2023', sales: 4400, revenue: 2450000, top: 'Paracetamol 500mg' },
  { year: '2024', period: 'FY 2024', sales: 5100, revenue: 2800000, top: 'Amoxicillin 500mg' },
  { year: '2025', period: 'FY 2025', sales: 5800, revenue: 3200000, top: 'Metformin 500mg' },
  { year: '2026', period: 'FY 2026', sales: 6400, revenue: 3600000, top: 'Amoxicillin 500mg' },
]

function getChartData(data) {
  return {
    labels: data.labels,
    datasets: [{
      label: 'Revenue (NPR)',
      data: data.revenue,
      backgroundColor: 'rgba(5, 150, 105, 0.7)',
      borderRadius: 6,
    }],
  }
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } } },
  scales: {
    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
    y: { ticks: { color: '#94a3b8', callback: (v) => 'NPR ' + (v / 1000) + 'k' }, grid: { color: 'rgba(148,163,184,0.1)' } },
  },
}

export default function FinancialReports() {
  const [view, setView] = useState('weekly')

  const currentData = view === 'weekly' ? weeklyData : view === 'monthly' ? monthlyData : yearlyData
  const salesTable = view === 'weekly' ? weeklySales : view === 'monthly' ? monthlySales : yearlySales

  const totalRevenue = currentData.revenue.reduce((a, b) => a + b, 0)
  const totalTransactions = currentData.transactions.reduce((a, b) => a + b, 0)
  const avgSale = Math.round(totalRevenue / totalTransactions)

  return (
    <div className="financial-reports">
      <div className="page-header" style={{ justifyContent: 'space-between' }}>
        <h2>Financial Reports</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`filter-tab ${view === 'weekly' ? 'active' : ''}`} onClick={() => setView('weekly')}>
            <Calendar size={16} /> Weekly
          </button>
          <button className={`filter-tab ${view === 'monthly' ? 'active' : ''}`} onClick={() => setView('monthly')}>
            <Calendar size={16} /> Monthly
          </button>
          <button className={`filter-tab ${view === 'yearly' ? 'active' : ''}`} onClick={() => setView('yearly')}>
            <Calendar size={16} /> Yearly
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">NPR {totalRevenue.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Transactions</span>
            <span className="stat-value">{totalTransactions.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Avg. Sale Value</span>
            <span className="stat-value">NPR {avgSale.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 className="card-title">
            <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
            Revenue ({view === 'weekly' ? 'This Week' : view === 'monthly' ? 'This Year' : 'All Years'})
          </h3>
          <div style={{ height: '280px' }}>
            <Bar data={getChartData(currentData)} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.25rem', marginTop: '1.5rem' }}>
        <h3 className="card-title">
          <Receipt size={18} style={{ color: 'var(--primary)' }} />
          {view === 'weekly' ? 'Weekly' : view === 'monthly' ? 'Monthly' : 'Yearly'} Sales Report
        </h3>
        <div className="table-card" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{view === 'weekly' ? 'Day' : view === 'monthly' ? 'Month' : 'Year'}</th>
                <th>Period</th>
                <th>Transactions</th>
                <th>Revenue (NPR)</th>
                <th>Avg. Sale</th>
                <th>Top Medicine</th>
              </tr>
            </thead>
            <tbody>
              {salesTable.map((row, i) => {
                const avg = Math.round(row.revenue / row.sales)
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{row.day || row.month || row.year}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{row.period}</td>
                    <td>{row.sales}</td>
                    <td className="price-cell">NPR {row.revenue.toLocaleString()}</td>
                    <td className="price-cell">NPR {avg.toLocaleString()}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{row.top}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: 700, borderBottom: 'none' }}>Total:</td>
                <td style={{ fontWeight: 700, borderBottom: 'none' }}>{totalTransactions.toLocaleString()}</td>
                <td className="price-cell" style={{ fontSize: '1rem', color: 'var(--primary)', borderBottom: 'none' }}>NPR {totalRevenue.toLocaleString()}</td>
                <td className="price-cell" style={{ fontWeight: 700, borderBottom: 'none' }}>NPR {avgSale.toLocaleString()}</td>
                <td style={{ borderBottom: 'none' }}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  )
}
