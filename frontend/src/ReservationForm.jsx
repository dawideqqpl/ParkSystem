// Plik: frontend/src/ReservationForm.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // Importujemy toasta

function ReservationForm({ onAddReservation, onCancel, onUpdateReservation, editingReservation }) {
  // ... (reszta kodu stanu bez zmian)
  const [licensePlate, setLicensePlate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const isEditing = !!editingReservation;

  useEffect(() => {
    if (isEditing) {
      setLicensePlate(editingReservation.licensePlate);
      setCustomerName(editingReservation.customerName);
      setReturnDate(editingReservation.returnDate);
    }
  }, [editingReservation, isEditing]);


  const handleSubmit = (event) => {
    event.preventDefault();
    if (!licensePlate || !customerName || !returnDate) {
      // Zastępujemy alert tostem
      toast.error('Proszę wypełnić wszystkie pola!');
      return;
    }

    const reservationData = {
      licensePlate,
      customerName,
      returnDate,
    };

    if (isEditing) {
      onUpdateReservation({ ...reservationData, id: editingReservation.id });
    } else {
      onAddReservation({ ...reservationData, id: Date.now() });
    }
  };

  // ... (reszta kodu JSX formularza bez zmian)
  return (
    <div className="bg-slate-100 p-6 rounded-lg mb-6 border border-slate-200">
      <h3 className="text-xl font-semibold mb-4">
        {isEditing ? 'Edytuj rezerwację' : 'Dodaj nową rezerwację'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="licensePlate" className="block text-sm font-medium text-slate-700 mb-1">Numer rejestracyjny</label>
          <input type="text" id="licensePlate" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value.toUpperCase())} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="np. WGM 12345"/>
        </div>
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-slate-700 mb-1">Imię i nazwisko klienta</label>
          <input type="text" id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="np. Jan Kowalski"/>
        </div>
        <div>
          <label htmlFor="returnDate" className="block text-sm font-medium text-slate-700 mb-1">Data i godzina powrotu</label>
          <input type="datetime-local" id="returnDate" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div className="flex justify-end gap-4">
          <button type="button" onClick={onCancel} className="bg-slate-500 text-white px-5 py-2 rounded-lg hover:bg-slate-600 transition">Anuluj</button>
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition">
            {isEditing ? 'Zapisz zmiany' : 'Zapisz rezerwację'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReservationForm;