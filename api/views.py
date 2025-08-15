import json
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from webpush.utils import send_to_subscription
from webpush.models import PushInformation, SubscriptionInfo  # Dodajemy SubscriptionInfo
from .models import PushSubscription, Reservation
from .serializers import ReservationSerializer


class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]
    queryset = Reservation.objects.all()

    def get_queryset(self):
        return self.request.user.reservations.all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_push_subscription(request):
    try:
        sub_data = request.data

        # Krok 1: Tworzymy/aktualizujemy SubscriptionInfo
        subscription_info, created = SubscriptionInfo.objects.update_or_create(
            endpoint=sub_data.get('endpoint'),
            defaults={
                'p256dh': sub_data.get('keys', {}).get('p256dh'),
                'auth': sub_data.get('keys', {}).get('auth')
            }
        )

        # Krok 2: Tworzymy/aktualizujemy PushInformation i łączymy z użytkownikiem
        push_info, created = PushInformation.objects.update_or_create(
            user=request.user,
            subscription=subscription_info,
            defaults={}
        )

        # Krok 3: Łączymy z naszym własnym modelem PushSubscription
        PushSubscription.objects.update_or_create(
            user=request.user,
            defaults={'subscription': push_info}
        )

        # Krok 4: Wysyłamy powiadomienie powitalne
        payload = json.dumps({"head": "Witaj!", "body": "Powiadomienia zostały pomyślnie aktywowane."})
        send_to_subscription(subscription_info, payload, ttl=1000)

        return Response({'status': 'ok'})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=500)
