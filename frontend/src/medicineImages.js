const medicineImages = {
  'Paracetamol 500mg': '/medicines/paracetamol_500mg.png',
  'Amoxicillin 500mg': '/medicines/amoxicillin_500mg.png',
  'Cetirizine 10mg': '/medicines/cetirizine_10mg.png',
  'Metformin 500mg': '/medicines/metformin_500mg.png',
  'Amlodipine 5mg': '/medicines/amlodipine_5mg.jpg',
  'Omeprazole 20mg': '/medicines/omeprazole_20mg.png',
  'Azithromycin 500mg': '/medicines/azithromycin_500mg.png',
  'Pantoprazole 40mg': '/medicines/pantoprazole_40mg.png',
  'Montelukast 10mg': '/medicines/montelukast_10mg.jpg',
  'Ciprofloxacin 500mg': '/medicines/ciprocin_500mg.png',
  'Vitamin C 500mg': '/medicines/vitamin_c_500mg.png',
  'ORS Electrolyte Powder': '/medicines/ors_electrolyte.jpg',
  'Flexon MR Tablet': '/medicines/flexon_mr.png',
  'Metrogyl 400mg': '/medicines/metrogyl_400mg.png',
  'Astat 20mg': '/medicines/astat_20mg.png',
  'Coxipro 400mg': '/medicines/coxipro_60mg.png',
  'Coxflam 100mg': '/medicines/coxflam_100mg.png',
  'Ciprocin 500mg': '/medicines/ciprocin_500mg.png',
}

const fallbackImage = '/medicines/paracetamol_500mg.png'

export function getMedicineImage(name) {
  return medicineImages[name] || fallbackImage
}

export function getMedicineImageWithFallback(name) {
  const src = medicineImages[name] || fallbackImage
  return {
    src,
    onError: (e) => { e.target.src = fallbackImage }
  }
}
