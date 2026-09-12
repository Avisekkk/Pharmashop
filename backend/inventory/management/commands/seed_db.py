import os
from django.core.management.base import BaseCommand
from inventory.models import Category, Supplier, Medicine


class Command(BaseCommand):
    help = 'Seed the database with sample pharmacy data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        categories = [
            {'name': 'Analgesic', 'description': 'Pain relief medications'},
            {'name': 'Antibiotic', 'description': 'Antibacterial medications'},
            {'name': 'Antihistamine', 'description': 'Allergy treatment medications'},
            {'name': 'Antidiabetic', 'description': 'Diabetes management medications'},
            {'name': 'Antihypertensive', 'description': 'Blood pressure medications'},
            {'name': 'Antacid', 'description': 'Gastric acid medications'},
            {'name': 'Anti-Asthmatic', 'description': 'Asthma treatment medications'},
            {'name': 'Vitamin Supplement', 'description': 'Nutritional supplements'},
        ]

        cat_objs = {}
        for cat_data in categories:
            cat, _ = Category.objects.get_or_create(name=cat_data['name'], defaults=cat_data)
            cat_objs[cat.name] = cat

        suppliers_data = [
            {'name': 'Sun Pharma Distributors', 'contact_person': 'Rajesh Mehta', 'email': 'rajesh@sunpharma.com', 'phone': '+91 98765 43210', 'address': 'Mumbai, Maharashtra'},
            {'name': 'Cipla Logistics', 'contact_person': 'Amit Sharma', 'email': 'amit@cipla.com', 'phone': '+91 98765 43211', 'address': 'Mumbai, Maharashtra'},
            {'name': "Dr. Reddy's Supply Chain", 'contact_person': 'Priya Nair', 'email': 'priya@drreddys.com', 'phone': '+91 98765 43212', 'address': 'Hyderabad, Telangana'},
            {'name': 'Zydus Cadila Medical', 'contact_person': 'Vikram Patel', 'email': 'vikram@zydus.com', 'phone': '+91 98765 43213', 'address': 'Ahmedabad, Gujarat'},
            {'name': 'Alkem Laboratories', 'contact_person': 'Sanjay Kumar', 'email': 'sanjay@alkem.com', 'phone': '+91 98765 43214', 'address': 'Mumbai, Maharashtra'},
        ]

        sup_objs = {}
        for sup_data in suppliers_data:
            sup, _ = Supplier.objects.get_or_create(name=sup_data['name'], defaults=sup_data)
            sup_objs[sup.name] = sup

        medicines_data = [
            {'name': 'Paracetamol 500mg', 'category': 'Analgesic', 'manufacturer': 'Cipla', 'batch_number': 'PCM-2024-001', 'dosage_form': 'tablet', 'strength': '500mg', 'stock': 150, 'price': 25, 'cost_price': 18, 'expiry_date': '2027-06-30', 'approval_status': 'approved', 'supplier': 'Cipla Logistics'},
            {'name': 'Amoxicillin 500mg', 'category': 'Antibiotic', 'manufacturer': 'Sun Pharma', 'batch_number': 'AMX-2024-002', 'dosage_form': 'capsule', 'strength': '500mg', 'stock': 45, 'price': 120, 'cost_price': 85, 'expiry_date': '2027-03-15', 'approval_status': 'approved', 'supplier': 'Sun Pharma Distributors'},
            {'name': 'Cetirizine 10mg', 'category': 'Antihistamine', 'manufacturer': "Dr. Reddy's", 'batch_number': 'CTZ-2024-003', 'dosage_form': 'tablet', 'strength': '10mg', 'stock': 8, 'price': 35, 'cost_price': 22, 'expiry_date': '2027-09-20', 'approval_status': 'approved', 'supplier': "Dr. Reddy's Supply Chain"},
            {'name': 'Metformin 500mg', 'category': 'Antidiabetic', 'manufacturer': 'USV Ltd', 'batch_number': 'MET-2024-004', 'dosage_form': 'tablet', 'strength': '500mg', 'stock': 200, 'price': 45, 'cost_price': 30, 'expiry_date': '2027-12-10', 'approval_status': 'approved', 'supplier': 'Sun Pharma Distributors'},
            {'name': 'Amlodipine 5mg', 'category': 'Antihypertensive', 'manufacturer': 'Pfizer', 'batch_number': 'AML-2024-005', 'dosage_form': 'tablet', 'strength': '5mg', 'stock': 3, 'price': 55, 'cost_price': 38, 'expiry_date': '2027-08-25', 'approval_status': 'pending', 'supplier': 'Sun Pharma Distributors'},
            {'name': 'Omeprazole 20mg', 'category': 'Antacid', 'manufacturer': 'AstraZeneca', 'batch_number': 'OMP-2024-006', 'dosage_form': 'capsule', 'strength': '20mg', 'stock': 80, 'price': 65, 'cost_price': 42, 'expiry_date': '2027-07-18', 'approval_status': 'approved', 'supplier': 'Cipla Logistics'},
            {'name': 'Azithromycin 500mg', 'category': 'Antibiotic', 'manufacturer': 'Zydus Cadila', 'batch_number': 'AZT-2024-007', 'dosage_form': 'tablet', 'strength': '500mg', 'stock': 60, 'price': 95, 'cost_price': 68, 'expiry_date': '2027-05-30', 'approval_status': 'approved', 'supplier': 'Zydus Cadila Medical'},
            {'name': 'Pantoprazole 40mg', 'category': 'Antacid', 'manufacturer': 'Alkem Labs', 'batch_number': 'PAN-2024-008', 'dosage_form': 'tablet', 'strength': '40mg', 'stock': 120, 'price': 78, 'cost_price': 52, 'expiry_date': '2027-11-05', 'approval_status': 'pending', 'supplier': 'Alkem Laboratories'},
            {'name': 'Montelukast 10mg', 'category': 'Anti-Asthmatic', 'manufacturer': 'Cipla', 'batch_number': 'MON-2024-009', 'dosage_form': 'tablet', 'strength': '10mg', 'stock': 95, 'price': 110, 'cost_price': 75, 'expiry_date': '2027-10-12', 'approval_status': 'approved', 'supplier': 'Cipla Logistics'},
            {'name': 'Ciprofloxacin 500mg', 'category': 'Antibiotic', 'manufacturer': 'Ranbaxy', 'batch_number': 'CIP-2024-010', 'dosage_form': 'tablet', 'strength': '500mg', 'stock': 35, 'price': 85, 'cost_price': 58, 'expiry_date': '2027-04-22', 'approval_status': 'approved', 'supplier': 'Sun Pharma Distributors'},
            {'name': 'Vitamin C 500mg', 'category': 'Vitamin Supplement', 'manufacturer': 'Sun Pharma', 'batch_number': 'VTC-2024-011', 'dosage_form': 'tablet', 'strength': '500mg', 'stock': 180, 'price': 40, 'cost_price': 25, 'expiry_date': '2027-12-31', 'approval_status': 'approved', 'supplier': 'Sun Pharma Distributors'},
            {'name': 'ORS Electrolyte Powder', 'category': 'Vitamin Supplement', 'manufacturer': 'Cipla', 'batch_number': 'ORS-2024-012', 'dosage_form': 'powder', 'strength': '1 sachet', 'stock': 200, 'price': 15, 'cost_price': 8, 'expiry_date': '2028-01-15', 'approval_status': 'approved', 'supplier': 'Cipla Logistics'},
            {'name': 'Flexon MR Tablet', 'category': 'Analgesic', 'manufacturer': 'Sun Pharma', 'batch_number': 'FLX-2024-013', 'dosage_form': 'tablet', 'strength': '400mg+500mg', 'stock': 70, 'price': 95, 'cost_price': 65, 'expiry_date': '2027-08-20', 'approval_status': 'approved', 'supplier': 'Sun Pharma Distributors'},
            {'name': 'Metrogyl 400mg', 'category': 'Antibiotic', 'manufacturer': 'J.B. Chemicals', 'batch_number': 'MTG-2024-014', 'dosage_form': 'tablet', 'strength': '400mg', 'stock': 55, 'price': 42, 'cost_price': 28, 'expiry_date': '2027-06-15', 'approval_status': 'approved', 'supplier': 'Alkem Laboratories'},
            {'name': 'Astat 20mg', 'category': 'Antacid', 'manufacturer': 'Alkem Labs', 'batch_number': 'AST-2024-015', 'dosage_form': 'tablet', 'strength': '20mg', 'stock': 90, 'price': 85, 'cost_price': 55, 'expiry_date': '2027-09-30', 'approval_status': 'approved', 'supplier': 'Alkem Laboratories'},
            {'name': 'Coxipro 60mg', 'category': 'Analgesic', 'manufacturer': 'Cipla', 'batch_number': 'CXP-2024-016', 'dosage_form': 'tablet', 'strength': '60mg', 'stock': 40, 'price': 60, 'cost_price': 40, 'expiry_date': '2027-07-25', 'approval_status': 'approved', 'supplier': 'Cipla Logistics'},
            {'name': 'Coxflam 100mg', 'category': 'Analgesic', 'manufacturer': 'Dr. Reddy\'s', 'batch_number': 'CXF-2024-017', 'dosage_form': 'tablet', 'strength': '100mg', 'stock': 25, 'price': 70, 'cost_price': 48, 'expiry_date': '2027-05-10', 'approval_status': 'approved', 'supplier': "Dr. Reddy's Supply Chain"},
            {'name': 'Ciprocin 500mg', 'category': 'Antibiotic', 'manufacturer': 'Sun Pharma', 'batch_number': 'CPC-2024-018', 'dosage_form': 'tablet', 'strength': '500mg', 'stock': 50, 'price': 130, 'cost_price': 90, 'expiry_date': '2027-11-20', 'approval_status': 'approved', 'supplier': 'Sun Pharma Distributors'},
        ]

        for med_data in medicines_data:
            cat_name = med_data.pop('category')
            sup_name = med_data.pop('supplier')
            Medicine.objects.get_or_create(
                batch_number=med_data['batch_number'],
                defaults={
                    **med_data,
                    'category': cat_objs.get(cat_name),
                    'supplier': sup_objs.get(sup_name),
                }
            )

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
