# Plik: api/middleware.py
class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Dodaj nagłówki CORS do WSZYSTKICH odpowiedzi
        origin = request.META.get('HTTP_ORIGIN')
        if origin in ['http://localhost:3000', 'http://127.0.0.1:3000']:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = (
                'accept, accept-encoding, authorization, content-type, dnt, '
                'origin, user-agent, x-csrftoken, x-requested-with, '
                'x-goog-authuser, x-origin, sec-fetch-dest, sec-fetch-mode, sec-fetch-site'
            )
        
        return response
