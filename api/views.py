# Plik: api/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
import json
import base64
import time

from .models import Reservation, UserProfile, PricingSettings
from .serializers import ReservationSerializer, UserProfileSerializer, PricingSettingsSerializer

class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # POPRAWIONE - używaj 'owner' zamiast 'user'
        return Reservation.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # POPRAWIONE - używaj 'owner' zamiast 'user'
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def toggle_complete(self, request, pk=None):
        """Toggle completion status of reservation"""
        reservation = self.get_object()
        reservation.is_completed = not reservation.is_completed
        reservation.save()
        
        reservation.refresh_from_db()
        serializer = self.get_serializer(reservation)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_payment(self, request, pk=None):
        """Toggle payment status of reservation"""
        reservation = self.get_object()
        reservation.is_paid = not reservation.is_paid
        reservation.save()
        
        reservation.refresh_from_db()
        serializer = self.get_serializer(reservation)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def flight_status(self, request, pk=None):
        """Get flight status for reservation"""
        reservation = self.get_object()
        
        if not reservation.flightNumber:
            return Response(
                {'error': 'Brak numeru lotu dla tej rezerwacji'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mock data - można dodać prawdziwe API lotów
        mock_data = {
            'flight_number': reservation.flightNumber,
            'status': 'On Time',
            'scheduled_time': reservation.returnDate,
            'estimated_time': reservation.returnDate,
            'terminal': 'A',
            'delay': 0
        }
        
        return Response(mock_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    except UserProfile.DoesNotExist:
        return Response({'error': 'Profil nie istnieje'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_user_plan(request):
    print("=== DEBUG SET PLAN ===")
    print("Request data:", request.data)
    print("Request user:", request.user)
    
    plan_code = request.data.get('plan_code')
    print("Extracted plan_code:", plan_code)
    
    if not plan_code:
        print("ERROR: No plan_code in request")
        return Response({'error': 'Brak kodu planu'}, status=400)
    
    # Sprawdź czy plan_code jest prawidłowy
    valid_plans = ['small', 'medium', 'large']
    if plan_code not in valid_plans:
        print(f"ERROR: Invalid plan_code: {plan_code}")
        return Response({'error': 'Nieprawidłowy kod planu'}, status=400)
    
    try:
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        print(f"Profile created: {created}, existing profile: {profile}")
        
        profile.plan_code = plan_code
        profile.plan = plan_code  # Ustaw też pole plan
        profile.save()
        
        print(f"Updated profile: plan={profile.plan}, plan_code={profile.plan_code}")
        
        serializer = UserProfileSerializer(profile)
        print("Serializer data:", serializer.data)
        
        return Response(serializer.data)
        
    except Exception as e:
        print(f"ERROR saving profile: {e}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def pricing_settings_view(request):
    settings, created = PricingSettings.objects.get_or_create(
        user=request.user,
        defaults={
            'day_1': 10.00,
            'day_2': 18.00,
            'day_3': 25.00,
            'day_4': 30.00,
            'day_5': 35.00,
            'day_6': 40.00,
            'day_7': 45.00,
            'extra_day': 5.00,
        }
    )
    
    if request.method == 'GET':
        serializer = PricingSettingsSerializer(settings)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = PricingSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

# Custom Google Login View
@api_view(['POST'])
def google_login(request):
    id_token = request.data.get('id_token') or request.data.get('access_token')
    
    if not id_token:
        return Response({'error': 'Brak tokena'}, status=400)
    
    try:
        # Dekoduj JWT token (id_token z Google)
        parts = id_token.split('.')
        if len(parts) != 3:
            return Response({'error': 'Nieprawidłowy format tokena'}, status=400)
        
        # Dekoduj payload (środkową część)
        payload = parts[1]
        # Dodaj padding jeśli potrzebne
        payload += '=' * (4 - len(payload) % 4)
        decoded_bytes = base64.urlsafe_b64decode(payload)
        google_data = json.loads(decoded_bytes)
        
        email = google_data.get('email')
        if not email:
            return Response({'error': 'Brak emaila w tokenie'}, status=400)
        
        # Sprawdź czy token nie wygasł
        if google_data.get('exp', 0) < time.time():
            return Response({'error': 'Token wygasł'}, status=400)
        
        # Sprawdź audience (twój Google Client ID)
        expected_aud = "414021971459-hra2pdov2afb84nir47l2plhar0popf6.apps.googleusercontent.com"
        if google_data.get('aud') != expected_aud:
            return Response({'error': 'Nieprawidłowy audience'}, status=400)
        
        # Znajdź lub stwórz użytkownika
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': google_data.get('given_name', ''),
                'last_name': google_data.get('family_name', ''),
            }
        )
        
        # Stwórz lub pobierz profil użytkownika
        profile, _ = UserProfile.objects.get_or_create(user=user)
        
        # Stwórz JWT token dla aplikacji
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': {
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        })
        
    except Exception as e:
        return Response({'error': f'Błąd dekodowania tokena: {str(e)}'}, status=400)

# Backup - jeśli chcesz używać standardowego allauth (opcjonalne)
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://127.0.0.1:3000/"
    client_class = OAuth2Client
