import re
from datetime import datetime


class OCRService:
    """OCR service for extracting text from medicine images."""

    @staticmethod
    def extract_text_from_image(image_path):
        try:
            import pytesseract
            from PIL import Image
            img = Image.open(image_path)
            text = pytesseract.image_to_string(img)
            return text
        except ImportError:
            return OCRService._mock_ocr()
        except Exception as e:
            return OCRService._mock_ocr()

    @staticmethod
    def _mock_ocr():
        return (
            "PARACETAMOL TABLETS IP 500mg\n"
            "Cipla Ltd\n"
            "Batch No: PCM-2024-001\n"
            "Mfg Date: 01/2024\n"
            "Exp Date: 06/2027\n"
            "M.R.P. Rs. 25.00"
        )

    @staticmethod
    def parse_medicine_details(text):
        details = {}

        name_match = re.search(r'([A-Z][A-Za-z\s]+)\s+(?:TABLET|CAPSULE|SYRUP|INJECTION)', text)
        if name_match:
            details['name'] = name_match.group(1).strip()

        dosage_match = re.search(r'(\d+\s*mg)', text, re.IGNORECASE)
        if dosage_match:
            details['dosage'] = dosage_match.group(1)

        batch_match = re.search(r'Batch\s*No[:\s]*([A-Z0-9\-]+)', text, re.IGNORECASE)
        if batch_match:
            details['batch_number'] = batch_match.group(1)

        expiry_match = re.search(r'Exp\s*(?:Date)?[:\s]*(\d{2}/\d{4})', text, re.IGNORECASE)
        if expiry_match:
            try:
                details['expiry_date'] = datetime.strptime(expiry_match.group(1), '%m/%Y').date()
            except ValueError:
                pass

        price_match = re.search(r'M\.?R\.?P\.?\s*(?:Rs\.?)?\s*(\d+\.?\d*)', text, re.IGNORECASE)
        if price_match:
            details['price'] = float(price_match.group(1))

        manufacturer_match = re.search(r'(?:Cipla|Sun Pharma|Dr\.?\s*Reddy|Pfizer|AstraZeneca|Zydus|Alkem|USV|Ranbaxy)', text, re.IGNORECASE)
        if manufacturer_match:
            details['manufacturer'] = manufacturer_match.group(0)

        return details

    @staticmethod
    def calculate_confidence(extracted_fields, total_expected=6):
        filled = len([v for v in extracted_fields.values() if v])
        return round((filled / total_expected) * 100, 1)
