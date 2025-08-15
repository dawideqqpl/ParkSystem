// Plik: frontend/src/App.jsx
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast'; // Importujemy toasta
import * as api from './apiService';
import ReservationForm from './ReservationForm';
import ReservationList from './ReservationList';
import ConfirmModal from './ConfirmModal';
import Dashboard from './Dashboard';
import Spinner from './Spinner'; // Dodaj ten import


function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
function App() {
  const { logoutUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await api.getReservations();
        setReservations(response.data);
      } catch (error) {
        console.error("Błąd podczas pobierania danych:", error);
        // Zastępujemy alert tostem
        toast.error("Nie udało się połączyć z serwerem.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservations();
  }, []);

  // ... (stany bez zmian)
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);

  const handleAddReservation = (newReservationData) => {
    toast.promise(
      api.addReservation(newReservationData).then(response => {
        setReservations(current => [response.data, ...current]);
        setIsFormVisible(false);
      }),
      {
        loading: 'Dodawanie rezerwacji...',
        success: <b>Rezerwacja dodana!</b>,
        error: <b>Nie udało się dodać rezerwacji.</b>,
      }
    );
  };

  const handleUpdateReservation = (updatedReservation) => {
    toast.promise(
      api.updateReservation(updatedReservation.id, updatedReservation).then(response => {
        setReservations(current => 
          current.map(res => res.id === updatedReservation.id ? response.data : res)
        );
        setIsFormVisible(false);
        setEditingReservation(null);
      }),
      {
        loading: 'Aktualizowanie...',
        success: <b>Rezerwacja zaktualizowana!</b>,
        error: <b>Nie udało się zaktualizować.</b>,
      }
    );
  };

  const confirmDelete = () => {
    toast.promise(
      api.deleteReservation(reservationToDelete).then(() => {
        setReservations(current => 
          current.filter(res => res.id !== reservationToDelete)
        );
        setIsModalOpen(false);
        setReservationToDelete(null);
      }),
      {
        loading: 'Usuwanie...',
        success: <b>Rezerwacja usunięta!</b>,
        error: <b>Nie udało się usunąć.</b>,
      }
    );
  };

  // ... (reszta logiki i JSX bez zmian)
  const handleEditRequest = (reservation) => {
    setEditingReservation(reservation);
    setIsFormVisible(true);
  };
  const handleAddRequest = () => {
    setEditingReservation(null);
    setIsFormVisible(true);
  };
  const handleCancelForm = () => {
    setIsFormVisible(false);
    setEditingReservation(null);
  };
  const handleDeleteRequest = (id) => {
    setReservationToDelete(id);
    setIsModalOpen(true);
  };
  const processedReservations = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = query
      ? reservations.filter(res =>
          res.licensePlate.toLowerCase().includes(query) ||
          res.customerName.toLowerCase().includes(query)
        )
      : reservations;
    return filtered.sort((a, b) => new Date(a.returnDate) - new Date(b.returnDate));
  }, [reservations, searchQuery]);

 const handleSubscribe = async () => {
    console.log('--- Rozpoczynam proces subskrypcji ---');

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.error('Błąd krytyczny: Przeglądarka nie wspiera Push API.');
      toast.error('Powiadomienia push nie są wspierane w tej przeglądarce.');
      return;
    }
    console.log('1. Sprawdzono wsparcie przeglądarki - OK');

    try {
      console.log('2. Proszę o zgodę na powiadomienia...');
      const permission = await Notification.requestPermission();
      console.log('3. Otrzymano odpowiedź na prośbę o zgodę:', permission);

      if (permission !== 'granted') {
        console.warn('Użytkownik nie wyraził zgody na powiadomienia.');
        toast.error('Odmówiono zgody na powiadomienia.');
        return;
      }

      console.log('4. Pobieram gotowość Service Workera...');
      const registration = await navigator.serviceWorker.ready;
      console.log('5. Service Worker jest gotowy. Próbuję subskrybować...');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array("BD44V2DTg_KurCkCS-ieNzkirmYE7wrLSKc4_FTVCpgJ5QbplIniFJNpOWAK7N5IJ2HwBPRrkp1yCtCRY2zC0Ro"),
      });
      console.log('6. Subskrypcja uzyskana pomyślnie:', subscription);

      console.log('7. Wysyłam subskrypcję do backendu...');
      await api.saveSubscription(subscription);
      console.log('8. Subskrypcja wysłana pomyślnie!');

      toast.success('Subskrypcja powiadomień aktywna!');

    } catch (error) {
      console.error('!!! ZŁAPANO BŁĄD PODCZAS SUBSKRYPCJI !!!', error);
      toast.error('Nie udało się zasubskrybować powiadomień.');
    }
  };


  return (
    <>
      <div className="bg-slate-100 min-h-screen font-sans">
        <div className="container mx-auto p-4 max-w-4xl">
          <header className="bg-blue-800 text-white p-6 rounded-lg shadow-lg mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">ParkSystem</h1>
              <p className="text-blue-200 mt-1">Centrum zarządzania parkingiem</p>
            </div>
            <button onClick={logoutUser} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
              Wyloguj
            </button>
          </header>
           <div className="mb-6">
            <button onClick={handleSubscribe} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition">
              Włącz powiadomienia push
            </button>
          </div>
          <Dashboard reservations={reservations} />

          <main className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-2xl font-semibold">Aktualne rezerwacje</h2>
              {!isFormVisible && (
                <button onClick={handleAddRequest} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-32">
                  + Dodaj nową
                </button>
              )}
            </div>

            {isFormVisible && (
              <ReservationForm 
                onAddReservation={handleAddReservation}
                onUpdateReservation={handleUpdateReservation}
                onCancel={handleCancelForm}
                editingReservation={editingReservation}
              />
            )}

            <div className="mb-6">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Szukaj po nr rejestracyjnym lub nazwisku..." className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"/>
            </div>

          {isLoading ? (
  <Spinner />
) : (
  <ReservationList 
    reservations={processedReservations}
    onDelete={handleDeleteRequest}
    onEdit={handleEditRequest}
  />
)}
          </main>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        message="Czy na pewno chcesz usunąć tę rezerwację? Tej operacji nie można cofnąć."
      />
    </>
  );
}

export default App;