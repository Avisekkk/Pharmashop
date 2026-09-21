import { GoogleGenAI } from '@google/genai'

const rawKeys = import.meta.env.VITE_GEMINI_API_KEY || ''
const apiKeys = rawKeys.split(',').map((k) => k.trim()).filter(Boolean)
let currentKeyIndex = 0

function isTransientError(err) {
  const msg = typeof err?.message === 'string' ? err.message : JSON.stringify(err)
  return msg.includes('429') || msg.includes('503') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('UNAVAILABLE') || msg.includes('quota') || msg.includes('overloaded')
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isGeminiConfigured() {
  return apiKeys.length > 0
}

function getNextKey() {
  const key = apiKeys[currentKeyIndex]
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length
  return key
}

export async function scanPrescription(base64Image) {
  if (apiKeys.length === 0) {
    throw new Error('Gemini API key not configured')
  }

  const prompt = `Analyze this medical prescription image. Extract the following information:
- patientName: the patient's name as written on the prescription
- doctorName: the prescribing doctor's name
- medicines: an array of medicines listed, each with:
  - name: the medicine name (as written on the prescription)
  - dosage: the strength or dosage (e.g., "500mg", "10ml")
  - frequency: how often to take (e.g., "3 times daily", "Twice a day", "Once daily")
  - notes: any special instructions (e.g., "After meals", "Before bedtime", "On empty stomach")

Return ONLY a valid JSON object with keys: patientName, doctorName, medicines.
Example: {"patientName":"John Doe","doctorName":"Dr. Smith","medicines":[{"name":"Amoxicillin","dosage":"500mg","frequency":"3 times daily","notes":"After meals"}]}

If you cannot identify patient or doctor name, use an empty string for that field.
If you cannot identify any medicines, return an empty array for medicines.
Do not include any text outside the JSON object.`

  const MAX_RETRIES = apiKeys.length * 3
  let lastError
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const key = getNextKey()
    const ai = new GoogleGenAI({ apiKey: key })

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: detectMimeType(base64Image),
                  data: extractBase64Data(base64Image),
                },
              },
            ],
          },
        ],
      })

      const text = typeof response.text === 'function' ? response.text() : response.text

      if (!text) {
        throw new Error('Empty response from Gemini')
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return { patientName: '', doctorName: '', medicines: [] }

      try {
        const result = JSON.parse(jsonMatch[0])
        const medicines = Array.isArray(result.medicines) ? result.medicines : []
        return {
          patientName: result.patientName || '',
          doctorName: result.doctorName || '',
          medicines: medicines.map((m) => ({
            name: m.name || '',
            dosage: m.dosage || '',
            frequency: m.frequency || '',
            notes: m.notes || '',
          })).filter((m) => m.name),
        }
      } catch {
        return { patientName: '', doctorName: '', medicines: [] }
      }
    } catch (err) {
      console.error(`Gemini API attempt ${attempt + 1}/${MAX_RETRIES} failed:`, err?.message || err)
      lastError = err
      if (isTransientError(err)) {
        await sleep(Math.min(1000 * (attempt + 1), 8000))
        continue
      }
      break
    }
  }

  if (lastError && isTransientError(lastError)) {
    throw new Error('Gemini service is currently overloaded. Please try again in a few moments.')
  }
  const errMsg = lastError?.message || 'Unknown error'
  throw new Error(`AI scan failed: ${errMsg}. Try again later or add medicines manually.`)
}

function detectMimeType(base64String) {
  if (base64String.startsWith('data:image/png')) return 'image/png'
  if (base64String.startsWith('data:image/jpeg') || base64String.startsWith('data:image/jpg')) return 'image/jpeg'
  if (base64String.startsWith('data:image/webp')) return 'image/webp'
  return 'image/png'
}

function extractBase64Data(base64String) {
  const commaIndex = base64String.indexOf(',')
  return commaIndex !== -1 ? base64String.substring(commaIndex + 1) : base64String
}
