from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Supplier(models.Model):
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Medicine(models.Model):
    DOSAGE_FORMS = [
        ('tablet', 'Tablet'),
        ('capsule', 'Capsule'),
        ('syrup', 'Syrup'),
        ('injection', 'Injection'),
        ('cream', 'Cream'),
        ('drops', 'Drops'),
        ('inhaler', 'Inhaler'),
        ('gel', 'Gel'),
        ('suspension', 'Suspension'),
        ('powder', 'Powder'),
    ]

    APPROVAL_STATUS = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='medicines')
    manufacturer = models.CharField(max_length=200, blank=True)
    batch_number = models.CharField(max_length=100, unique=True)
    dosage_form = models.CharField(max_length=20, choices=DOSAGE_FORMS, default='tablet')
    strength = models.CharField(max_length=50, blank=True)
    stock = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    expiry_date = models.DateField()
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name='medicines')
    approval_status = models.CharField(max_length=20, choices=APPROVAL_STATUS, default='pending')
    low_stock_threshold = models.PositiveIntegerField(default=20)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='medicines/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.strength})"

    @property
    def is_low_stock(self):
        return self.stock <= self.low_stock_threshold

    @property
    def is_expiring_soon(self):
        from datetime import date, timedelta
        return self.expiry_date <= date.today() + timedelta(days=60)

    @property
    def stock_status(self):
        if self.stock <= 5:
            return 'critical'
        elif self.is_low_stock:
            return 'low-stock'
        return 'in-stock'


class Sale(models.Model):
    customer_name = models.CharField(max_length=200, blank=True, default='Walk-in')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Sale #{self.id} - ₹{self.total_amount}"


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        self.total = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.medicine.name} x{self.quantity}"


class Alert(models.Model):
    SEVERITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    TYPE_CHOICES = [
        ('low-stock', 'Low Stock'),
        ('expiry', 'Expiry'),
        ('approval', 'Approval'),
        ('sales', 'Sales'),
    ]

    alert_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='medium')
    title = models.CharField(max_length=200)
    message = models.TextField()
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity}] {self.title}"


class Prescription(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    patient_name = models.CharField(max_length=200)
    patient_phone = models.CharField(max_length=20, blank=True)
    doctor_name = models.CharField(max_length=200, blank=True)
    prescription_image = models.ImageField(upload_to='prescriptions/')
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.CharField(max_length=200, blank=True)
    review_note = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Prescription #{self.id} - {self.patient_name} ({self.status})"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('prescription_approved', 'Prescription Approved'),
        ('prescription_rejected', 'Prescription Rejected'),
        ('order_ready', 'Order Ready'),
        ('low_stock', 'Low Stock'),
    ]

    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, null=True, blank=True)
    recipient = models.CharField(max_length=200, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notification_type}] {self.title}"
