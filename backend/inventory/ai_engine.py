import re
from datetime import datetime


class AIEngine:
    """AI engine for medicine data extraction and analysis."""

    MEDICINE_PATTERNS = {
        'name': r'(?:TABLET|CAPSULE|SYP INJ CREAM DROPS)\s+([A-Z][A-Za-z\s]+)',
        'dosage': r'(\d+\s*(?:mg|ml|g|mcg|iu))',
        'batch': r'(?:Batch|B\.No\.?\s*[:\s]*)([A-Z0-9\-]+)',
        'expiry': r'(?:Exp(?:iry)?\.?\s*[:\s]*)(\d{2}/\d{4}|\d{2}-\d{4}|\d{4})',
        'price': r'(?:M\.?R\.?P\.?\s*[:\s]*Rs\.?\s*)(\d+\.?\d*)',
    }

    @classmethod
    def extract_medicine_info(cls, text):
        results = {}
        for key, pattern in cls.MEDICINE_PATTERNS.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                results[key] = match.group(1).strip()
        return results

    @classmethod
    def calculate_stock_health(cls, stock, threshold):
        if stock <= 5:
            return 'critical'
        elif stock <= threshold:
            return 'low'
        return 'healthy'

    @classmethod
    def predict_reorder_quantity(cls, current_stock, avg_daily_sales, days_lead_time=7):
        safety_stock = avg_daily_sales * 7
        reorder_point = avg_daily_sales * days_lead_time + safety_stock
        return max(0, int(reorder_point - current_stock))

    @classmethod
    def analyze_expiry_risk(cls, expiry_date):
        today = datetime.now().date()
        days_until = (expiry_date - today).days
        if days_until <= 0:
            return {'risk': 'expired', 'action': 'Remove from inventory immediately'}
        elif days_until <= 30:
            return {'risk': 'critical', 'action': 'Offer heavy discount or return to supplier'}
        elif days_until <= 60:
            return {'risk': 'high', 'action': 'Apply promotional pricing'}
        elif days_until <= 90:
            return {'risk': 'medium', 'action': 'Monitor closely'}
        return {'risk': 'low', 'action': 'No action needed'}
