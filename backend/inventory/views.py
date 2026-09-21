from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Category, Supplier, Medicine, Sale, SaleItem, Alert, Prescription, Notification
from .serializers import (
    CategorySerializer, SupplierSerializer, MedicineSerializer,
    SaleSerializer, SaleItemSerializer, AlertSerializer,
    PrescriptionSerializer, NotificationSerializer
)
from .ai_engine import AIEngine


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.select_related('category', 'supplier').all()
    serializer_class = MedicineSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', '')
        category = self.request.query_params.get('category', '')
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(manufacturer__icontains=search) |
                Q(batch_number__icontains=search)
            )
        if category:
            qs = qs.filter(category__name=category)
        return qs

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        qs = self.get_queryset().filter(stock__lte=20)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        threshold = timezone.now().date() + timedelta(days=60)
        qs = self.get_queryset().filter(expiry_date__lte=threshold)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        medicine = self.get_object()
        medicine.approval_status = 'approved'
        medicine.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        medicine = self.get_object()
        medicine.approval_status = 'rejected'
        medicine.save()
        return Response({'status': 'rejected'})


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.prefetch_related('items__medicine').all()
    serializer_class = SaleSerializer


class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.select_related('medicine').all()
    serializer_class = AlertSerializer

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Alert.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})


@api_view(['GET'])
def dashboard_stats(request):
    total_medicines = Medicine.objects.count()
    low_stock_count = Medicine.objects.filter(stock__lte=20).count()
    today = timezone.now().date()
    today_sales = Sale.objects.filter(created_at__date=today)
    today_revenue = today_sales.aggregate(total=Sum('total_amount'))['total'] or 0
    today_transactions = today_sales.count()
    pending_approvals = Medicine.objects.filter(approval_status='pending').count()
    total_revenue = Sale.objects.aggregate(total=Sum('total_amount'))['total'] or 0

    return Response({
        'total_medicines': total_medicines,
        'low_stock_count': low_stock_count,
        'today_revenue': float(today_revenue),
        'today_transactions': today_transactions,
        'pending_approvals': pending_approvals,
        'total_revenue': float(total_revenue),
    })


@api_view(['GET'])
def sales_chart(request):
    today = timezone.now().date()
    days = []
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        revenue = Sale.objects.filter(created_at__date=date).aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        days.append({
            'date': date.strftime('%a'),
            'revenue': float(revenue),
        })
    return Response(days)


@api_view(['GET'])
def recent_activity(request):
    recent_sales = Sale.objects.all()[:5]
    recent_alerts = Alert.objects.all()[:5]
    return Response({
        'sales': SaleSerializer(recent_sales, many=True).data,
        'alerts': AlertSerializer(recent_alerts, many=True).data,
    })


# ─────────────────────────────────────────────
#  AI-POWERED ANALYSIS ENDPOINTS (pandas/numpy)
# ─────────────────────────────────────────────

@api_view(['GET'])
def ai_stock_health(request):
    """Analyze stock health for all medicines using pandas/numpy."""
    medicines_df = AIEngine.medicines_to_dataframe(Medicine.objects.all())
    sale_items_df = AIEngine.sale_items_to_dataframe(SaleItem.objects.all())
    analysis = AIEngine.analyze_stock_health_batch(medicines_df, sale_items_df)
    if analysis.empty:
        return Response({'results': [], 'summary': {}})
    summary = {
        'total_medicines': len(analysis),
        'critical': int((analysis['stock_health'] == 'critical').sum()),
        'low': int((analysis['stock_health'] == 'low').sum()),
        'healthy': int((analysis['stock_health'] == 'healthy').sum()),
        'total_reorder_quantity': int(analysis['reorder_quantity'].sum()),
    }
    results = analysis.to_dict(orient='records')
    # Convert numpy types to native Python types for JSON serialization
    for r in results:
        for k, v in r.items():
            if hasattr(v, 'item'):
                r[k] = v.item()
    return Response({'results': results, 'summary': summary})


@api_view(['GET'])
def ai_expiry_risk(request):
    """Analyze expiry risk for all medicines using pandas/numpy."""
    medicines_df = AIEngine.medicines_to_dataframe(Medicine.objects.all())
    analysis = AIEngine.analyze_expiry_risk_batch(medicines_df)
    if analysis.empty:
        return Response({'results': [], 'summary': {}})
    summary = {
        'total_medicines': len(analysis),
        'expired': int((analysis['risk_level'] == 'expired').sum()),
        'critical': int((analysis['risk_level'] == 'critical').sum()),
        'high': int((analysis['risk_level'] == 'high').sum()),
        'medium': int((analysis['risk_level'] == 'medium').sum()),
        'low': int((analysis['risk_level'] == 'low').sum()),
        'total_financial_risk': float(analysis['financial_risk'].sum()),
    }
    results = analysis.to_dict(orient='records')
    for r in results:
        for k, v in r.items():
            if hasattr(v, 'item'):
                r[k] = v.item()
            elif hasattr(v, 'isoformat'):
                r[k] = v.isoformat()
    return Response({'results': results, 'summary': summary})


@api_view(['GET'])
def ai_sales_trend(request):
    """Get sales trend analysis using pandas."""
    period = request.query_params.get('period', 'D')
    sales_df = AIEngine.sales_to_dataframe(Sale.objects.all())
    trend = AIEngine.get_sales_trend(sales_df, period=period)
    if trend.empty:
        return Response({'results': [], 'summary': {}})
    summary = {
        'total_revenue': float(trend['revenue'].sum()),
        'total_transactions': int(trend['transactions'].sum()),
        'avg_daily_revenue': float(trend['revenue'].mean()),
        'peak_revenue': float(trend['revenue'].max()),
    }
    return Response({'results': trend.to_dict(orient='records'), 'summary': summary})


@api_view(['GET'])
def ai_top_selling(request):
    """Get top selling medicines using pandas."""
    top_n = int(request.query_params.get('top_n', 5))
    sales_items_df = AIEngine.sale_items_to_dataframe(SaleItem.objects.all())
    medicines_df = AIEngine.medicines_to_dataframe(Medicine.objects.all())
    top = AIEngine.get_top_selling_medicines(sales_items_df, medicines_df, top_n=top_n)
    if top.empty:
        return Response({'results': []})
    results = top.to_dict(orient='records')
    for r in results:
        for k, v in r.items():
            if hasattr(v, 'item'):
                r[k] = v.item()
    return Response({'results': results})


@api_view(['GET'])
def ai_inventory_value(request):
    """Calculate inventory value statistics using numpy."""
    medicines_df = AIEngine.medicines_to_dataframe(Medicine.objects.all())
    stats = AIEngine.calculate_inventory_value(medicines_df)
    return Response(stats)


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        stat = self.request.query_params.get('status', '')
        if stat:
            qs = qs.filter(status=stat)
        return qs

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        prescription = self.get_object()
        prescription.status = 'approved'
        prescription.reviewed_by = request.data.get('reviewed_by', 'Admin')
        prescription.review_note = request.data.get('review_note', '')
        prescription.reviewed_at = timezone.now()
        prescription.save()

        Notification.objects.create(
            notification_type='prescription_approved',
            title='Prescription Approved',
            message=f'Your prescription #{prescription.id} has been approved by {prescription.reviewed_by}. You can now collect your medicines.',
            prescription=prescription,
            recipient=prescription.patient_name,
        )
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        prescription = self.get_object()
        prescription.status = 'rejected'
        prescription.reviewed_by = request.data.get('reviewed_by', 'Admin')
        prescription.review_note = request.data.get('review_note', '')
        prescription.reviewed_at = timezone.now()
        prescription.save()

        Notification.objects.create(
            notification_type='prescription_rejected',
            title='Prescription Rejected',
            message=f'Your prescription #{prescription.id} has been rejected. Reason: {prescription.review_note or "No reason provided."}',
            prescription=prescription,
            recipient=prescription.patient_name,
        )
        return Response({'status': 'rejected'})


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})
