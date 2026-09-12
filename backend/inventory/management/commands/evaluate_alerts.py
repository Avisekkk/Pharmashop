from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from inventory.models import Medicine, Alert


class Command(BaseCommand):
    help = 'Evaluate and generate alerts for low stock and expiring medicines'

    def handle(self, *args, **options):
        self.stdout.write('Evaluating alerts...')

        generated = 0

        low_stock_meds = Medicine.objects.filter(stock__lte=20)
        for med in low_stock_meds:
            severity = 'high' if med.stock <= 5 else 'medium'
            alert, created = Alert.objects.get_or_create(
                alert_type='low-stock',
                medicine=med,
                is_read=False,
                defaults={
                    'severity': severity,
                    'title': f'{"Critical" if severity == "high" else "Low"} Stock: {med.name}',
                    'message': f'{med.name} has only {med.stock} units remaining (threshold: {med.low_stock_threshold})',
                }
            )
            if created:
                generated += 1

        threshold_date = timezone.now().date() + timedelta(days=60)
        expiring_meds = Medicine.objects.filter(expiry_date__lte=threshold_date)
        for med in expiring_meds:
            days_left = (med.expiry_date - timezone.now().date()).days
            severity = 'high' if days_left <= 30 else 'medium'
            alert, created = Alert.objects.get_or_create(
                alert_type='expiry',
                medicine=med,
                is_read=False,
                defaults={
                    'severity': severity,
                    'title': f'Expiry Warning: {med.name}',
                    'message': f'{med.name} expires in {days_left} days ({med.expiry_date})',
                }
            )
            if created:
                generated += 1

        self.stdout.write(self.style.SUCCESS(f'Generated {generated} new alerts'))
