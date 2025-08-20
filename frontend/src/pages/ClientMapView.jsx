// Plik: frontend/src/pages/ClientMapView.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import * as api from '../apiService';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';

// --- NOWA, NIESTANDARDOWA IKONA SAMOCHODU Z ETYKIETĄ ---
const CarIcon = () => (
  <div className="relative flex flex-col items-center">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-blue-600 drop-shadow-lg">
      <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
      <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
    </svg>
    <div className="absolute -bottom-5 bg-white text-slate-800 text-xs font-bold px-2 py-0.5 rounded-md shadow-md">
      Kierowca
    </div>
  </div>
);

const carIcon = new L.divIcon({
  html: ReactDOMServer.renderToString(<CarIcon />),
  className: '', // Usuwamy domyślne style, aby nasz div działał poprawnie
  iconSize: [40, 58],
  iconAnchor: [20, 58], // Dół ikony
  popupAnchor: [0, -58] // Góra ikony
});


// --- SŁOWNIK TŁUMACZEŃ STATUSÓW ---
const statusTranslations = {
    AWAITING: 'Oczekuje na dostarczenie',
    IN_TRANSIT: 'W drodze',
    COMPLETED: 'Dostarczony',
};

function ClientMapView() {
    const { token } = useParams();
    const [reservation, setReservation] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = () => {
            api.getReservationByToken(token)
                .then(res => setReservation(res.data))
                .catch(() => setError('Nie można załadować danych. Link może być nieprawidłowy.'));
        };

        fetchData();
        const interval = setInterval(fetchData, 10000);

        return () => clearInterval(interval);
    }, [token]);

    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!reservation) return <div className="text-center p-8">Ładowanie mapy...</div>;

    const position = reservation.latitude && reservation.longitude ? [reservation.latitude, reservation.longitude] : null;
    
    // Używamy słownika do tłumaczenia statusu
    const statusText = statusTranslations[reservation.status] || 'Nieznany';

    return (
        <div>
            <div className="bg-white p-4 shadow-md text-center">
                <h1 className="text-xl font-bold">Śledzenie pojazdu</h1>
                <p>Status: <span className="font-semibold">{statusText}</span></p>
            </div>
            {reservation.status === 'IN_TRANSIT' && position ? (
                <MapContainer center={position} zoom={15} style={{ height: 'calc(100vh - 70px)', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={position} icon={carIcon}>
                        <Popup>
                            Kierowca z Twoim autem jest tutaj.
                        </Popup>
                    </Marker>
                </MapContainer>
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-8" style={{ height: 'calc(100vh - 70px)' }}>
                    <h2 className="text-2xl font-semibold mb-2">Kierowca jeszcze nie wyruszył.</h2>
                    <p className="text-slate-600">Lokalizacja pojawi się na mapie, gdy tylko podróż się rozpocznie.</p>
                </div>
            )}
        </div>
    );
}

export default ClientMapView;
