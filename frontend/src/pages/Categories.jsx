import { useState } from 'react'
import { Plus, Tag, Edit3, Trash2 } from 'lucide-react'

const initialCategories = [
  { id: 1, name: 'Analgesic', count: 45, description: 'Pain relief medications' },
  { id: 2, name: 'Antibiotic', count: 38, description: 'Antibacterial medications' },
  { id: 3, name: 'Antihistamine', count: 22, description: 'Allergy treatment medications' },
  { id: 4, name: 'Antidiabetic', count: 28, description: 'Diabetes management medications' },
  { id: 5, name: 'Antihypertensive', count: 35, description: 'Blood pressure medications' },
  { id: 6, name: 'Antacid', count: 18, description: 'Gastric acid medications' },
  { id: 7, name: 'Anti-Asthmatic', count: 15, description: 'Asthma treatment medications' },
  { id: 8, name: 'Vitamin Supplement', count: 25, description: 'Nutritional supplements' },
]

export default function Categories() {
  const [categories, setCategories] = useState(initialCategories)
  const [showForm, setShowForm] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', description: '' })

  const addCategory = () => {
    if (newCat.name) {
      setCategories([...categories, { ...newCat, id: categories.length + 1, count: 0 }])
      setNewCat({ name: '', description: '' })
      setShowForm(false)
    }
  }

  const removeCategory = (id) => {
    setCategories(categories.filter((c) => c.id !== id))
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <div>
          <h2>Categories</h2>
          <p className="page-subtitle">{categories.length} medicine categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3 className="card-title">New Category</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                value={newCat.name}
                onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                placeholder="e.g., Antibiotic"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={newCat.description}
                onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                placeholder="e.g., Antibacterial medications"
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={addCategory}>Save</button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="categories-grid">
        {categories.map((cat) => (
          <div key={cat.id} className="category-card card">
            <div className="category-icon">
              <Tag size={24} />
            </div>
            <h3 className="category-name">{cat.name}</h3>
            <p className="category-desc">{cat.description}</p>
            <span className="category-count">{cat.count} medicines</span>
            <div className="category-actions">
              <button className="icon-btn" title="Edit"><Edit3 size={16} /></button>
              <button className="icon-btn danger" title="Delete" onClick={() => removeCategory(cat.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
