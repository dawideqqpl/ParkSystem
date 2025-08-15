# Plik: api/models.py
from django.db import models
from django.contrib.auth.models import User
from webpush.models import PushInformation # Importujemy model z biblioteki

class Reservation(models.Model):
    owner = models.ForeignKey(User, related_name='reservations', on_delete=models.CASCADE)
    licensePlate = models.CharField(max_length=20)
    customerName = models.CharField(max_length=100)
    returnDate = models.DateTimeField()

    def __str__(self):
        return self.licensePlate

# Wracamy do poprawnej architektury z kluczem obcym
class PushSubscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='push_subscription')
    # Przechowujemy referencję do obiektu z biblioteki webpush
    subscription = models.ForeignKey(PushInformation, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username