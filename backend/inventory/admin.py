from django.contrib import admin
from .models import Category, Supplier, Medicine, Sale, SaleItem, Alert


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'created_at']
    search_fields = ['name']


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_person', 'email', 'phone']
    search_fields = ['name', 'contact_person']


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'manufacturer', 'batch_number', 'stock', 'price', 'expiry_date', 'approval_status']
    list_filter = ['approval_status', 'category', 'dosage_form']
    search_fields = ['name', 'batch_number', 'manufacturer']


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'total_amount', 'created_at']
    list_filter = ['created_at']


@admin.register(SaleItem)
class SaleItemAdmin(admin.ModelAdmin):
    list_display = ['sale', 'medicine', 'quantity', 'unit_price', 'total']


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ['title', 'alert_type', 'severity', 'is_read', 'created_at']
    list_filter = ['alert_type', 'severity', 'is_read']
