from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'suppliers', views.SupplierViewSet)
router.register(r'medicines', views.MedicineViewSet)
router.register(r'sales', views.SaleViewSet)
router.register(r'alerts', views.AlertViewSet)
router.register(r'prescriptions', views.PrescriptionViewSet)
router.register(r'notifications', views.NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    path('dashboard/sales-chart/', views.sales_chart, name='sales-chart'),
    path('dashboard/recent-activity/', views.recent_activity, name='recent-activity'),
    path('ai/stock-health/', views.ai_stock_health, name='ai-stock-health'),
    path('ai/expiry-risk/', views.ai_expiry_risk, name='ai-expiry-risk'),
    path('ai/sales-trend/', views.ai_sales_trend, name='ai-sales-trend'),
    path('ai/top-selling/', views.ai_top_selling, name='ai-top-selling'),
    path('ai/inventory-value/', views.ai_inventory_value, name='ai-inventory-value'),
]
