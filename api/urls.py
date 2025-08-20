# Plik: api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReservationViewSet,
    get_user_profile,
    set_user_plan,
    pricing_settings_view,
    google_login,
    GoogleLogin  # opcjonalnie jeśli używasz allauth
)

# Konfiguracja routera dla ViewSets
router = DefaultRouter()
router.register(r'reservations', ReservationViewSet, basename='reservation')

urlpatterns = [
    # API endpoints z routera (zawiera automatyczne endpointy dla ReservationViewSet)
    path('', include(router.urls)),
    
    # Custom endpoints
    path('profile/', get_user_profile, name='user-profile'),
    path('set-plan/', set_user_plan, name='set-user-plan'),
    path('pricing-settings/', pricing_settings_view, name='pricing-settings'),
    
    # Google authentication
    path('auth/google/', google_login, name='google_login'),
    
    # Opcjonalne - standardowy allauth endpoint
    # path('auth/google/allauth/', GoogleLogin.as_view(), name='google_login_allauth'),
]
