from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Category, Supplier, Medicine, Sale, SaleItem, Alert
from .serializers import (
    CategorySerializer, SupplierSerializer, MedicineSerializer,
    SaleSerializer, SaleItemSerializer, AlertSerializer
)


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
