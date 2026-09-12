from rest_framework import serializers
from .models import Category, Supplier, Medicine, Sale, SaleItem, Alert


class CategorySerializer(serializers.ModelSerializer):
    medicine_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = '__all__'

    def get_medicine_count(self, obj):
        return obj.medicines.count()


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class MedicineSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True, default='')
    stock_status = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    is_expiring_soon = serializers.ReadOnlyField()

    class Meta:
        model = Medicine
        fields = '__all__'


class SaleItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)

    class Meta:
        model = SaleItem
        fields = '__all__'


class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)

    class Meta:
        model = Sale
        fields = '__all__'


class AlertSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True, default='')

    class Meta:
        model = Alert
        fields = '__all__'
