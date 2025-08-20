# Plik: parksystem_backend/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Dołączamy wszystkie adresy z naszej aplikacji API
    path('api/', include('api.urls')),
    
    # --- POPRAWIONE ŚCIEŻKI DO REJESTRACJI I LOGOWANIA ---
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    
    # Dodajemy standardowe allauth URLs (potrzebne do działania social auth)
    path('accounts/', include('allauth.urls')),
]
