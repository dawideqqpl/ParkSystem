# Plik: api/signals.py
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import UserProfile, PricingSettings

@receiver(post_save, sender=User)
def create_user_related_objects(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
        PricingSettings.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_related_objects(sender, instance, **kwargs):
    # Sprawdzamy, czy profil i cennik istnieją, zanim spróbujemy je zapisać
    # To zabezpieczenie na wypadek, gdyby sygnał był wywołany przed stworzeniem obiektu
    if hasattr(instance, 'profile'):
        instance.profile.save()
    if hasattr(instance, 'pricing_settings'):
        instance.pricing_settings.save()
