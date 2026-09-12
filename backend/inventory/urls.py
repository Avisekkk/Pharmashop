from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'suppliers', views.SupplierViewSet)
router.register(r'medicines', views.MedicineViewSet)
router.register(r'sales', views.SaleViewSet)
router.register(r'alerts', views.AlertViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    path('dashboard/sales-chart/', views.sales_chart, name='sales-chart'),
    path('dashboard/recent-activity/', views.recent_activity, name='recent-activity'),
]
