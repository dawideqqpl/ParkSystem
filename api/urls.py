# Plik: api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReservationViewSet, save_push_subscription # Dodaj nowy widok

router = DefaultRouter()
router.register(r'reservations', ReservationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Nowa ścieżka do zapisywania subskrypcji
    path('save-subscription/', save_push_subscription, name='save-subscription'),
]