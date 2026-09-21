const medicineCatalog = [
  { id: 1, name: 'Paracetamol 500mg', price: 120 },
  { id: 2, name: 'Amoxicillin 500mg', price: 450 },
  { id: 3, name: 'Cetirizine 10mg', price: 85 },
  { id: 4, name: 'Metformin 500mg', price: 320 },
  { id: 6, name: 'Omeprazole 20mg', price: 180 },
  { id: 7, name: 'Azithromycin 500mg', price: 350 },
  { id: 10, name: 'Vitamin C 500mg', price: 150 },
  { id: 11, name: 'Ciprofloxacin 500mg', price: 280 },
  { id: 12, name: 'Pantoprazole 40mg', price: 200 },
  { id: 13, name: 'Amlodipine 5mg', price: 150 },
  { id: 14, name: 'Montelukast 10mg', price: 220 },
  { id: 15, name: 'Metronidazole 400mg', price: 90 },
]

export function getItemPrice(item) {
  if (item.price > 0) return item.price
  const nameLower = (item.name || '').trim().toLowerCase()
  const match = medicineCatalog.find(m => {
    const catalogLower = m.name.toLowerCase()
    return catalogLower === nameLower || catalogLower.includes(nameLower) || nameLower.includes(catalogLower)
  })
  return match?.price || 0
}

export function getItemTotal(item) {
  return getItemPrice(item) * (item.qty || 1)
}

export default medicineCatalog
