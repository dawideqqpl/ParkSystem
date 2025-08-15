# Plik: parksystem_backend/urls.py
from django.contrib import admin
from django.urls import path, include
# Importujemy widoki z biblioteki JWT
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # Nowe ścieżki do logowania i odświeżania tokenu
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]