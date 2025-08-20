// Plik: frontend/src/ReservationForm.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DatePicker, { registerLocale } from 'react-datepicker';
import { pl } from 'date-fns/locale/pl';
import * as api from './apiService';

registerLocale('pl', pl);

const ReservationForm = ({ reservation, onSubmit, onCancel, userProfile }) => {
    const [licensePlate, setLicensePlate] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [returnDate, setReturnDate] = useState(null);
    const [flightNumber, setFlightNumber] = useState('');
    const [passengerCount, setPassengerCount] = useState(1);
    const [price, setPrice] = useState(null);
    const [pricingSettings, setPricingSettings] = useState(null);
    const [isPaid, setIsPaid] = useState(false);

    const isEditing = Boolean(reservation);

    // Zamknij modal przy naciśnięciu ESC
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27) {
                onCancel();
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [onCancel]);

    // Zablokuj scrollowanie body gdy modal jest otwarty
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        api.getPricingSettings().then(res => setPricingSettings(res.data));
    }, []);

     useEffect(() => {
        console.log('useEffect - reservation:', reservation);
        
        if (reservation) {
            // Tryb edycji
            setLicensePlate(reservation.licensePlate || '');
            setCustomerName(reservation.customerName || '');
            setPhoneNumber(reservation.phone_number || '');
            setReturnDate(new Date(reservation.returnDate || new Date()));
            setFlightNumber(reservation.flightNumber || '');
            setPassengerCount(reservation.passenger_count || 1);
            setIsPaid(Boolean(reservation.is_paid));
        } else {
            // Tryb dodawania - reset
            setLicensePlate('');
            setCustomerName('');
            setPhoneNumber('');
            setReturnDate(new Date());
            setFlightNumber('');
            setPassengerCount(1);
            setIsPaid(false);
        }
    }, [reservation]);

    useEffect(() => {
        if (returnDate && pricingSettings) {
            const startDate = new Date();
            const endDate = new Date(returnDate);
            
            if (endDate < startDate) {
                setPrice(0);
                return;
            }
            
            const diffTime = endDate - startDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 0) {
                setPrice(0);
                return;
            }
            
            if (diffDays === 1) {
                setPrice(pricingSettings.day_1);
                return;
            }
            if (diffDays === 2) {
                setPrice(pricingSettings.day_2);
                return;
            }
            if (diffDays === 3) {
                setPrice(pricingSettings.day_3);
                return;
            }
            if (diffDays === 4) {
                setPrice(pricingSettings.day_4);
                return;
            }
            if (diffDays === 5) {
                setPrice(pricingSettings.day_5);
                return;
            }
            if (diffDays === 6) {
                setPrice(pricingSettings.day_6);
                return;
            }
            if (diffDays === 7) {
                setPrice(pricingSettings.day_7);
                return;
            }
            if (diffDays > 7) {
                const extraDays = diffDays - 7;
                const total = parseFloat(pricingSettings.day_7) + (extraDays * parseFloat(pricingSettings.extra_day));
                setPrice(total.toFixed(2));
                return;
            }
        } else {
            setPrice(null);
        }
    }, [returnDate, pricingSettings]);

    const handleSubmit = (event) => {
        event.preventDefault();
        
        if (!licensePlate || !customerName || !returnDate) {
            toast.error('Proszę wypełnić wymagane pola!');
            return;
        }

        const reservationData = {
            licensePlate,
            customerName,
            phone_number: phoneNumber,
            returnDate: returnDate.toISOString(),
            flightNumber: flightNumber.trim() === '' ? null : flightNumber.trim().toUpperCase(),
            passenger_count: passengerCount,
            is_paid: isPaid,
        };

        // POPRAWIONE - użyj onSubmit
        if (isEditing) {
            onSubmit({ ...reservationData, id: reservation.id });
        } else {
            onSubmit(reservationData);
        }
    };
    return (
        <>
            {/* MODAL OVERLAY */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={(e) => {
                    // Zamknij modal gdy kliknięto tło
                    if (e.target === e.currentTarget) {
                        onCancel();
                    }
                }}
            >
                {/* MODAL CONTENT */}
                <div 
                    className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()} // Zatrzymaj propagację, żeby nie zamknęło modala
                >
                    {/* HEADER */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {isEditing ? '✏️ Edytuj rezerwację' : '➕ Dodaj nową rezerwację'}
                        </h2>
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                            title="Zamknij"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* FORMULARZ */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Pierwsza linia - Numer rejestracyjny + Imię */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-2">
                                    Numer rejestracyjny *
                                </label>
                                <input
                                    type="text"
                                    id="licensePlate"
                                    value={licensePlate}
                                    onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="np. AB 12345"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Imię i nazwisko *
                                </label>
                                <input
                                    type="text"
                                    id="customerName"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Jan Kowalski"
                                    required
                                />
                            </div>
                        </div>

                        {/* Druga linia - Telefon + Liczba osób */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                    Numer telefonu
                                </label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="+48 123 456 789"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="passengerCount" className="block text-sm font-medium text-gray-700 mb-2">
                                    Liczba osób
                                </label>
                                <input
                                    type="number"
                                    id="passengerCount"
                                    value={passengerCount}
                                    onChange={(e) => setPassengerCount(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    min="1"
                                    max="20"
                                />
                            </div>
                        </div>

                        {/* Trzecia linia - Numer lotu */}
                        <div>
                            <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                Numer lotu (opcjonalnie)
                            </label>
                            <input
                                type="text"
                                id="flightNumber"
                                value={flightNumber}
                                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="np. LO123, FR4567"
                            />
                        </div>

                        {/* Status płatności */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isPaid"
                                    checked={isPaid}
                                    onChange={(e) => setIsPaid(e.target.checked)}
                                    className="h-5 w-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                />
                                <label htmlFor="isPaid" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                                    <span className="mr-2">💰</span>
                                    Klient zapłacił za parking
                                </label>
                            </div>
                            <p className="text-xs text-yellow-600 mt-2">
                                Zaznacz jeśli klient już zapłacił za usługę parkingu
                            </p>
                        </div>

                        {/* Data i godzina powrotu */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data i godzina powrotu *
                            </label>
                            <DatePicker
                                selected={returnDate}
                                onChange={(date) => setReturnDate(date)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="dd.MM.yyyy HH:mm"
                                locale="pl"
                                placeholderText="Wybierz datę i godzinę"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                minDate={new Date()}
                                required
                            />
                        </div>

                        {/* Szacowana cena */}
                        {price !== null && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-green-800 mb-1 flex items-center">
                                    <span className="mr-2">{isPaid ? '💰' : '💸'}</span>
                                    Szacowana cena: {price} PLN
                                    {isPaid && <span className="ml-2 text-sm">(zapłacone)</span>}
                                </h3>
                                <p className="text-sm text-green-600">
                                    Cena może się różnić w zależności od ostatecznej daty odbioru
                                </p>
                            </div>
                        )}

                        {/* PRZYCISKI */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Anuluj
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                {isEditing ? 'Zaktualizuj rezerwację' : 'Dodaj rezerwację'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ReservationForm;
