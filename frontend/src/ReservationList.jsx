// Plik: frontend/src/ReservationList.jsx

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  return isoString.replace('T', ' ');
};

// --- NOWA FUNKCJA ---
// Sprawdza datę rezerwacji i zwraca jej status: 'urgent' (dziś), 'soon' (jutro), lub 'normal'
const getReservationStatus = (returnDateString) => {
  const returnDate = new Date(returnDateString);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  // Resetujemy godziny, minuty i sekundy, aby porównywać tylko daty
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  returnDate.setHours(0, 0, 0, 0);

  if (returnDate.getTime() === today.getTime()) {
    return 'urgent'; // Powrót dzisiaj
  }
  if (returnDate.getTime() === tomorrow.getTime()) {
    return 'soon'; // Powrót jutro
  }
  return 'normal'; // Inny termin
};


function ReservationList({ reservations, onDelete, onEdit }) {
  if (reservations.length === 0) {
    return <p className="text-center text-slate-500 py-8">Brak rezerwacji.</p>;
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => {
        // --- NOWA LOGIKA ---
        // Pobieramy status i na jego podstawie wybieramy klasy CSS
        const status = getReservationStatus(reservation.returnDate);
        const statusClasses = {
          urgent: 'bg-red-50 border-red-300',
          soon: 'bg-yellow-50 border-yellow-300',
          normal: 'bg-slate-50 border-slate-200',
        };

        return (
          // Dodajemy dynamiczne klasy do głównego diva
          <div 
            key={reservation.id} 
            className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition-colors ${statusClasses[status]}`}
          >
            <div className="flex-grow">
              <p className="font-mono text-lg font-bold text-slate-800">{reservation.licensePlate}</p>
              <p className="text-slate-600">{reservation.customerName}</p>
            </div>
            <div className="flex justify-between items-center w-full sm:w-auto gap-2">
               <div className="text-left sm:text-right">
                  <p className="text-sm text-slate-500">Powrót:</p>
                  <p className="font-semibold text-slate-800">{formatDateTime(reservation.returnDate)}</p>
               </div>
               <div className="flex gap-2">
                  <button 
                      onClick={() => onEdit(reservation)}
                      className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg hover:bg-yellow-200 transition text-sm font-semibold"
                  >
                      Edytuj
                  </button>
                  <button 
                      onClick={() => onDelete(reservation.id)}
                      className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition text-sm font-semibold"
                  >
                      Usuń
                  </button>
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ReservationList;