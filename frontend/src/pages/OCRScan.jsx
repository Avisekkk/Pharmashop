import { useState, useRef } from 'react'
import { ScanLine, Upload, Camera, FileText, CheckCircle, XCircle } from 'lucide-react'

export default function OCRScan() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (f) {
      setFile(f)
      setPreview(URL.createObjectURL(f))
      setResult(null)
    }
  }

  const handleScan = async () => {
    if (!file) return
    setScanning(true)
    // Simulate OCR processing
    setTimeout(() => {
      setResult({
        medicine_name: 'Paracetamol 500mg',
        dosage: '500mg',
        manufacturer: 'Cipla Ltd',
        batch_number: 'PCM-2024-001',
        expiry_date: '2027-06-30',
        confidence: 94.5,
        detected_text: [
          'PARACETAMOL TABLETS IP 500mg',
          'Cipla Ltd',
          'Batch No: PCM-2024-001',
          'Mfg Date: 01/2024',
          'Exp Date: 06/2027',
          'M.R.P. Rs. 25.00',
        ],
      })
      setScanning(false)
    }, 2000)
  }

  return (
    <div className="ocr-page">
      <div className="page-header">
        <div>
          <h2>OCR Medicine Scanner</h2>
          <p className="page-subtitle">Upload a medicine image to extract details</p>
        </div>
      </div>

      <div className="ocr-grid">
        <div className="card upload-card">
          <h3 className="card-title">
            <Camera size={18} /> Upload Image
          </h3>
          <div
            className="upload-zone"
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="upload-preview" />
            ) : (
              <>
                <Upload size={48} className="upload-icon" />
                <p>Click to upload medicine image</p>
                <span className="upload-hint">Supports JPG, PNG, HEIC</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              hidden
            />
          </div>
          <button
            className="btn btn-primary full-width"
            onClick={handleScan}
            disabled={!file || scanning}
          >
            <ScanLine size={18} />
            {scanning ? 'Scanning...' : 'Scan Medicine'}
          </button>
        </div>

        <div className="card result-card">
          <h3 className="card-title">
            <FileText size={18} /> Scan Results
          </h3>
          {result ? (
            <div className="scan-result">
              <div className="confidence-bar">
                <span>Confidence: {result.confidence}%</span>
                <div className="confidence-track">
                  <div
                    className="confidence-fill"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>
              <div className="result-fields">
                <div className="result-field">
                  <label>Medicine Name</label>
                  <span>{result.medicine_name}</span>
                </div>
                <div className="result-field">
                  <label>Dosage</label>
                  <span>{result.dosage}</span>
                </div>
                <div className="result-field">
                  <label>Manufacturer</label>
                  <span>{result.manufacturer}</span>
                </div>
                <div className="result-field">
                  <label>Batch Number</label>
                  <span>{result.batch_number}</span>
                </div>
                <div className="result-field">
                  <label>Expiry Date</label>
                  <span>{result.expiry_date}</span>
                </div>
              </div>
              <div className="detected-text">
                <h4>Detected Text:</h4>
                {result.detected_text.map((line, i) => (
                  <div key={i} className="text-line">
                    <CheckCircle size={14} /> {line}
                  </div>
                ))}
              </div>
              <div className="result-actions">
                <button className="btn btn-primary">Add to Inventory</button>
                <button className="btn btn-outline">Save to Database</button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <ScanLine size={48} />
              <p>Upload a medicine image and scan to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
