# Plik: api/models.py
from django.db import models
from django.contrib.auth.models import User
from webpush.models import PushInformation
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
import uuid

class Reservation(models.Model):
    owner = models.ForeignKey(User, related_name='reservations', on_delete=models.CASCADE)
    licensePlate = models.CharField(max_length=20)
    customerName = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    returnDate = models.DateTimeField()
    is_completed = models.BooleanField(default=False)
    is_paid = models.BooleanField(default=False)  # TO POLE MUSI ISTNIEĆ
    created_at = models.DateTimeField(auto_now_add=True)
    flightNumber = models.CharField(max_length=10, blank=True, null=True)
    passenger_count = models.PositiveSmallIntegerField(default=1)
    is_completed = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return self.licensePlate

class PushSubscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='push_subscription')
    subscription = models.ForeignKey(PushInformation, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username

class FlightStatusCache(models.Model):
    flight_number = models.CharField(max_length=20, db_index=True)
    flight_date = models.DateField(db_index=True)
    json_response = models.JSONField()
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('flight_number', 'flight_date')

    def __str__(self):
        return f"{self.flight_number} on {self.flight_date}"

class UserProfile(models.Model):
    PLAN_CHOICES = [
        ('small', 'MAŁY PARKING'),
        ('medium', 'ŚREDNI PARKING'),
        ('large', 'DUŻY PARKING'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES, null=True, blank=True)
    
    # DODANE POLA
    plan_code = models.CharField(max_length=10, null=True, blank=True)  # 'small', 'medium', 'large'
    usage = models.IntegerField(default=0)  # Aktualne użycie

    def get_limit(self):
        if self.plan == 'medium':
            return 100  # Zaktualizowane limity zgodnie z frontend
        if self.plan == 'large':
            return 500
        if self.plan == 'small':
            return 50
        return 0
    
    # DODANA WŁAŚCIWOŚĆ dla serializera
    @property
    def limit(self):
        return self.get_limit()
    
    # DODANA WŁAŚCIWOŚĆ - czytelna nazwa planu
    @property
    def plan_name(self):
        plan_names = {
            'small': 'MAŁY PARKING',
            'medium': 'ŚREDNI PARKING',
            'large': 'DUŻY PARKING'
        }
        return plan_names.get(self.plan, '')

    def __str__(self):
        return f"Profil dla {self.user.username}"

class PricingSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='pricing_settings')
    day_1 = models.DecimalField(max_digits=6, decimal_places=2, default=50.00)
    day_2 = models.DecimalField(max_digits=6, decimal_places=2, default=90.00)
    day_3 = models.DecimalField(max_digits=6, decimal_places=2, default=130.00)
    day_4 = models.DecimalField(max_digits=6, decimal_places=2, default=170.00)
    day_5 = models.DecimalField(max_digits=6, decimal_places=2, default=200.00)
    day_6 = models.DecimalField(max_digits=6, decimal_places=2, default=230.00)
    day_7 = models.DecimalField(max_digits=6, decimal_places=2, default=250.00)
    extra_day = models.DecimalField(max_digits=6, decimal_places=2, default=20.00)

    def __str__(self):
        return f"Cennik dla {self.user.username}"



@receiver([post_save, post_delete], sender=Reservation)
def update_user_usage(sender, instance, **kwargs):
    """Automatycznie aktualizuj usage gdy rezerwacja zostanie dodana/usunięta"""
    profile = UserProfile.objects.get(user=instance.owner)  # UŻYWAJ 'owner'
    active_reservations = Reservation.objects.filter(
        owner=instance.owner,  # UŻYWAJ 'owner'
        is_completed=False
    ).count()
    profile.usage = active_reservations
    profile.save()