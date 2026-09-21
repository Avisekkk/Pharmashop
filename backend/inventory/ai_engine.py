import re
import numpy as np
import pandas as pd
from datetime import datetime, timedelta


class AIEngine:
    """AI engine for medicine data extraction and analysis using pandas/numpy."""

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

    # ─────────────────────────────────────────────
    #  PANDAS / NUMPY POWERED METHODS
    # ─────────────────────────────────────────────

    @staticmethod
    def sales_to_dataframe(sales_queryset):
        """Convert Django Sale queryset to a pandas DataFrame."""
        records = list(sales_queryset.values(
            'id', 'customer_name', 'total_amount', 'created_at'
        ))
        df = pd.DataFrame(records)
        if not df.empty:
            df['created_at'] = pd.to_datetime(df['created_at'])
            df['date'] = df['created_at'].dt.date
            df['day_name'] = df['created_at'].dt.day_name()
            df['week'] = df['created_at'].dt.isocalendar().week.astype(int)
            df['month'] = df['created_at'].dt.month
        return df

    @staticmethod
    def sale_items_to_dataframe(sale_items_queryset):
        """Convert Django SaleItem queryset to a pandas DataFrame."""
        records = list(sale_items_queryset.values(
            'id', 'sale_id', 'medicine_id', 'quantity', 'unit_price', 'total'
        ))
        df = pd.DataFrame(records)
        if not df.empty:
            df['total'] = df['total'].astype(float)
            df['unit_price'] = df['unit_price'].astype(float)
        return df

    @staticmethod
    def medicines_to_dataframe(medicines_queryset):
        """Convert Django Medicine queryset to a pandas DataFrame."""
        records = list(medicines_queryset.values(
            'id', 'name', 'stock', 'price', 'cost_price',
            'expiry_date', 'low_stock_threshold', 'category_id',
            'approval_status', 'batch_number'
        ))
        df = pd.DataFrame(records)
        if not df.empty:
            df['expiry_date'] = pd.to_datetime(df['expiry_date'])
            df['price'] = df['price'].astype(float)
            df['cost_price'] = df['cost_price'].astype(float)
        return df

    @classmethod
    def analyze_stock_health_batch(cls, medicines_df, sales_items_df):
        """Use pandas/numpy to analyze stock health based on actual sales velocity.

        Returns a DataFrame with columns: id, name, stock, avg_daily_sales,
        days_of_stock, stock_health, reorder_quantity
        """
        if medicines_df.empty:
            return pd.DataFrame()

        today = pd.Timestamp.now().date()
        recent_cutoff = pd.Timestamp.now() - pd.Timedelta(days=30)

        if not sales_items_df.empty:
            recent_sales = sales_items_df.copy()
            avg_sales = recent_sales.groupby('medicine_id')['quantity'].mean()
            std_sales = recent_sales.groupby('medicine_id')['quantity'].std().fillna(0)
        else:
            avg_sales = pd.Series(dtype=float)
            std_sales = pd.Series(dtype=float)

        result = medicines_df.copy()
        result['avg_daily_sales'] = result['id'].map(avg_sales).fillna(0) / 30.0
        result['std_daily_sales'] = result['id'].map(std_sales).fillna(0) / 30.0
        result['days_of_stock'] = np.where(
            result['avg_daily_sales'] > 0,
            result['stock'] / result['avg_daily_sales'],
            np.where(result['stock'] == 0, 0, 999)
        )

        def classify_health(row):
            if row['stock'] == 0:
                return 'critical'
            elif row['days_of_stock'] <= 3:
                return 'critical'
            elif row['days_of_stock'] <= 7 or row['stock'] <= row['low_stock_threshold']:
                return 'low'
            return 'healthy'

        result['stock_health'] = result.apply(classify_health, axis=1)

        result['reorder_quantity'] = np.where(
            result['avg_daily_sales'] > 0,
            np.maximum(0, np.ceil(
                result['avg_daily_sales'] * 7 + result['std_daily_sales'] * np.sqrt(7) * 2
                - result['stock']
            ).astype(int)),
            0
        )

        return result[['id', 'name', 'stock', 'avg_daily_sales', 'days_of_stock',
                        'stock_health', 'reorder_quantity']]

    @classmethod
    def analyze_expiry_risk_batch(cls, medicines_df):
        """Use pandas/numpy to analyze expiry risk for all medicines.

        Returns a DataFrame with columns: id, name, stock, expiry_date,
        days_until_expiry, risk_level, financial_risk, recommended_action
        """
        if medicines_df.empty:
            return pd.DataFrame()

        today = pd.Timestamp.now().date()
        result = medicines_df.copy()
        result['days_until_expiry'] = (
            result['expiry_date'].dt.date - today
        ).apply(lambda x: x.days)

        result['stock_value'] = result['stock'] * result['price']

        def classify_expiry_risk(row):
            days = row['days_until_expiry']
            if days <= 0:
                return 'expired', 'Remove from inventory immediately'
            elif days <= 30:
                return 'critical', 'Offer heavy discount or return to supplier'
            elif days <= 60:
                return 'high', 'Apply promotional pricing'
            elif days <= 90:
                return 'medium', 'Monitor closely'
            return 'low', 'No action needed'

        risk_data = result.apply(classify_expiry_risk, axis=1, result_type='expand')
        result['risk_level'] = risk_data[0]
        result['recommended_action'] = risk_data[1]

        result['financial_risk'] = np.where(
            result['risk_level'].isin(['expired', 'critical', 'high']),
            result['stock_value'],
            0
        )

        return result[['id', 'name', 'stock', 'expiry_date', 'days_until_expiry',
                        'risk_level', 'stock_value', 'financial_risk',
                        'recommended_action']]

    @classmethod
    def get_sales_trend(cls, sales_df, period='D'):
        """Use pandas to calculate sales trend over time.

        Args:
            period: 'D' for daily, 'W' for weekly, 'M' for monthly
        Returns:
            DataFrame with date and revenue columns
        """
        if sales_df.empty:
            return pd.DataFrame(columns=['date', 'revenue', 'transactions'])

        df = sales_df.copy()
        df['period'] = pd.to_datetime(df['created_at']).dt.to_period(period)

        trend = df.groupby('period').agg(
            revenue=('total_amount', 'sum'),
            transactions=('id', 'count')
        ).reset_index()

        trend['date'] = trend['period'].astype(str)
        trend['revenue'] = trend['revenue'].astype(float)

        return trend[['date', 'revenue', 'transactions']]

    @classmethod
    def get_top_selling_medicines(cls, sales_items_df, medicines_df, top_n=5):
        """Use pandas to find top selling medicines by quantity and revenue."""
        if sales_items_df.empty:
            return pd.DataFrame()

        merged = sales_items_df.merge(
            medicines_df[['id', 'name']], left_on='medicine_id', right_on='id', how='left'
        )

        top = merged.groupby(['medicine_id', 'name']).agg(
            total_quantity=('quantity', 'sum'),
            total_revenue=('total', 'sum')
        ).reset_index()

        top = top.sort_values('total_quantity', ascending=False).head(top_n)
        top['total_revenue'] = top['total_revenue'].astype(float)

        return top[['name', 'total_quantity', 'total_revenue']]

    @classmethod
    def get_category_sales_distribution(cls, sales_items_df, medicines_df):
        """Use pandas to analyze sales distribution by medicine category."""
        if sales_items_df.empty or medicines_df.empty:
            return pd.DataFrame()

        merged = sales_items_df.merge(
            medicines_df[['id', 'category_id']], left_on='medicine_id',
            right_on='id', how='left'
        )

        dist = merged.groupby('category_id').agg(
            total_quantity=('quantity', 'sum'),
            total_revenue=('total', 'sum')
        ).reset_index()

        dist['total_revenue'] = dist['total_revenue'].astype(float)

        return dist

    @classmethod
    def calculate_inventory_value(cls, medicines_df):
        """Use numpy to calculate total inventory value and statistics."""
        if medicines_df.empty:
            return {
                'total_value': 0,
                'total_items': 0,
                'avg_medicine_price': 0,
                'low_stock_items': 0,
                'expiring_items': 0,
            }

        medicines_df['stock_value'] = medicines_df['stock'] * medicines_df['price']
        today = pd.Timestamp.now().date()

        return {
            'total_value': float(medicines_df['stock_value'].sum()),
            'total_items': int(medicines_df['stock'].sum()),
            'avg_medicine_price': float(medicines_df['price'].mean()),
            'low_stock_items': int(
                (medicines_df['stock'] <= medicines_df['low_stock_threshold']).sum()
            ),
            'expiring_items': int(
                (medicines_df['expiry_date'].dt.date - today).apply(lambda x: x.days <= 60).sum()
            ),
        }
