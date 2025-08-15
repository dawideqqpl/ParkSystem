import json
from django.core.management.base import BaseCommand
from django.conf import settings
from api.models import PushSubscription
from pywebpush import webpush, WebPushException


class Command(BaseCommand):
    help = 'Sends a test push notification'

    def handle(self, *args, **kwargs):
        subscriptions = PushSubscription.objects.all()
        if not subscriptions:
            self.stdout.write(self.style.WARNING('Brak subskrypcji.'))
            return

        self.stdout.write(f'Znaleziono {subscriptions.count()} subskrypcji. Wysyłanie...')
        payload = json.dumps({"head": "Test", "body": "To jest testowe powiadomienie! 🎉"})

        for sub in subscriptions:
            # Poprawne odwoływanie się do pól przez relacje
            subscription_dict = {
                "endpoint": sub.subscription.subscription.endpoint,
                "keys": {
                    "p256dh": sub.subscription.subscription.p256dh, 
                    "auth": sub.subscription.subscription.auth
                }
            }
            try:
                webpush(
                    subscription_info=subscription_dict, 
                    data=payload,
                    vapid_private_key=settings.WEBPUSH_SETTINGS.get("VAPID_PRIVATE_KEY"),
                    vapid_claims={"sub": "mailto:" + settings.WEBPUSH_SETTINGS.get("VAPID_ADMIN_EMAIL")}
                )
                self.stdout.write(self.style.SUCCESS(f'Wysłano do użytkownika: {sub.user.username}'))
            except WebPushException as e:
                self.stderr.write(self.style.ERROR(f'Błąd dla {sub.user.username}: {e}'))

        self.stdout.write(self.style.SUCCESS('Wysyłka zakończona.'))
