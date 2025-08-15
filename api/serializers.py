# Plik: api/serializers.py
from rest_framework import serializers
from .models import Reservation

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        # Dodajemy 'owner' do pól, ale ustawimy go jako tylko do odczytu
        fields = ['id', 'owner', 'licensePlate', 'customerName', 'returnDate']
        read_only_fields = ['owner']