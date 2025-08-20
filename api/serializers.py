# Plik: api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Reservation, UserProfile, PricingSettings

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = [
            'id', 'licensePlate', 'customerName', 'phone_number', 
            'returnDate', 'flightNumber', 'passenger_count', 'price', 
            'is_completed', 'is_paid', 'created_at'
        ]

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    limit = serializers.ReadOnlyField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'plan', 'plan_code', 'usage', 'limit',
            'email', 'first_name', 'last_name'
        ]

class PricingSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingSettings
        fields = [
            'id', 'day_1', 'day_2', 'day_3', 'day_4', 
            'day_5', 'day_6', 'day_7', 'extra_day'
        ]

# Opcjonalnie - serializer dla użytkownika (jeśli potrzebny)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
