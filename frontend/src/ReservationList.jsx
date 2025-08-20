// Plik: frontend/src/ReservationList.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as api from './apiService';

const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Hook do pobierania cen
const usePricingSettings = () => {
    const [pricingSettings, setPricingSettings] = useState(null);

    useEffect(() => {
        const fetchPricingSettings = async () => {
            try {
                const response = await api.getPricingSettings();
                console.log('Pricing settings from API:', response.data);
                setPricingSettings(response.data);
            } catch (error) {
                console.error('Error fetching pricing settings:', error);
                const fallbackSettings = {
                    price_1_day: 50.00,
                    price_2_days: 90.00,
                    price_3_days: 130.00,
                    price_4_days: 170.00,
                    price_5_days: 200.00,
                    price_6_days: 230.00,
                    price_7_days: 250.00,
                    price_additional_day: 20.00
                };
                console.log('Using fallback pricing:', fallbackSettings);
                setPricingSettings(fallbackSettings);
            }
        };
        fetchPricingSettings();
    }, []);

    return pricingSettings;
};

// Funkcja formatowania telefonu
const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    const numbers = phoneNumber.replace(/\D/g, '');
    if (numbers.length >= 9) {
        return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 9)}`;
    } else if (numbers.length >= 6) {
        return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6)}`;
    } else if (numbers.length >= 3) {
        return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    }
    return numbers;
};

// POPRAWIONA funkcja obliczania ceny
const calculatePrice = (reservation, pricingSettings) => {
    if (!pricingSettings) {
        console.log('No pricing settings available');
        return '0.00';
    }

    console.log('Calculating price for reservation:', reservation);
    console.log('Using pricing settings:', pricingSettings);

    // POPRAWKA - użyj różnych pól dla daty rozpoczęcia
    let startDate;
    if (reservation.created_at) {
        startDate = new Date(reservation.created_at);
    } else if (reservation.createdAt) {
        startDate = new Date(reservation.createdAt);
    } else if (reservation.checkInDate) {
        startDate = new Date(reservation.checkInDate);
    } else {
        // Jeśli nie ma daty rozpoczęcia, użyj dzisiejszej daty
        startDate = new Date();
    }

    const endDate = new Date(reservation.returnDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const days = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    
    console.log('Start date:', startDate);
    console.log('End date:', endDate);
    console.log('Calculated days:', days);

    // POPRAWKA - sprawdź różne nazwy pól w pricing settings
    let totalPrice = 0;
    
    const priceFields = {
        1: pricingSettings.price_1_day || pricingSettings['1_day'] || 50.00,
        2: pricingSettings.price_2_days || pricingSettings['2_days'] || 90.00,
        3: pricingSettings.price_3_days || pricingSettings['3_days'] || 130.00,
        4: pricingSettings.price_4_days || pricingSettings['4_days'] || 170.00,
        5: pricingSettings.price_5_days || pricingSettings['5_days'] || 200.00,
        6: pricingSettings.price_6_days || pricingSettings['6_days'] || 230.00,
        7: pricingSettings.price_7_days || pricingSettings['7_days'] || 250.00,
        additional: pricingSettings.price_additional_day || pricingSettings.additional_day || 20.00
    };

    console.log('Price fields:', priceFields);
    
    if (days <= 7) {
        totalPrice = priceFields[days];
    } else {
        totalPrice = priceFields[7] + ((days - 7) * priceFields.additional);
    }
    
    console.log('Total price calculated:', totalPrice);
    return totalPrice.toFixed(2);
};

// Komponent dla pojedynczej rezerwacji
const ReservationItem = ({ reservation, onToggleComplete, onEdit, onDelete, onCheckFlight, onTogglePayment, isInGroup = false }) => {
    const { t } = useTranslation();
    
    // Pobierz ustawienia cenowe
    const pricingSettings = usePricingSettings();
    const price = calculatePrice(reservation, pricingSettings);

    const getReservationStatus = (returnDateString) => {
        const returnDate = new Date(returnDateString);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);
        returnDate.setHours(0, 0, 0, 0);

        if (returnDate.getTime() === today.getTime()) return 'urgent';
        if (returnDate.getTime() === tomorrow.getTime()) return 'soon';
        return 'normal';
    };

    const status = getReservationStatus(reservation.returnDate);
    const statusClasses = {
        urgent: 'bg-red-50 border-red-300 border-l-4 border-l-red-500',
        soon: 'bg-yellow-50 border-yellow-300 border-l-4 border-l-yellow-500',
        normal: 'bg-white border-gray-200 border-l-4 border-l-blue-500',
    };

    const completedClass = reservation.is_completed ? 'opacity-70 bg-gray-50' : '';
    const containerClass = isInGroup 
        ? 'bg-transparent border-0 shadow-none p-2' 
        : `${statusClasses[status]} ${completedClass} p-4 rounded-xl shadow-sm`;

    const handleCall = () => {
        if (reservation.phone_number) {
            window.open(`tel:${reservation.phone_number}`);
        } else {
            toast.error('Brak numeru telefonu');
        }
    };

    // POPRAWKA - rozwiązanie problemu HTTP ERROR 451
    const handleFlightStatus = async () => {
        if (reservation.flightNumber) {
            const flightUrl = `https://www.flightradar24.com/data/flights/${reservation.flightNumber}`;
            
            try {
                // Skopiuj link do schowka jako bezpieczna opcja
                await navigator.clipboard.writeText(flightUrl);
                toast.success(`Link skopiowany do schowka: ${reservation.flightNumber}. Wklej w przeglądarce.`, {
                    duration: 4000,
                });
                
                // Próbuj również otworzyć w nowej karcie
                const newWindow = window.open('about:blank', '_blank');
                if (newWindow) {
                    setTimeout(() => {
                        newWindow.location.href = flightUrl;
                    }, 500);
                }
            } catch (error) {
                // Jeśli clipboard nie działa, pokaż link w toast
                toast.error(`Otwórz ręcznie: ${flightUrl}`, {
                    duration: 6000,
                });
            }
        } else {
            toast.error('Brak numeru lotu');
        }
    };

    return (
        <div className={containerClass}>
            {/* GÓRNY RĄD - kompaktowy */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">
                        {reservation.licensePlate}
                    </h3>
                    <p className="text-gray-700 font-medium">
                        {reservation.customerName}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        reservation.is_completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                        {reservation.is_completed ? 'Zakończone' : 'Aktywne'}
                    </span>
                    {/* KLIKNIĘCIE ZMIENIA STATUS PŁATNOŚCI */}
                    <button
                        onClick={() => onTogglePayment(reservation.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            reservation.is_paid 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                    >
                        {reservation.is_paid ? '✓ Zapłacone' : '✗ Nie zapłacone'}
                    </button>
                </div>
            </div>

            {/* SZCZEGÓŁY - kompaktowe */}
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                <div>
                    <span className="font-medium">Data powrotu:</span><br />
                    <span className="text-gray-800">{formatDateTime(reservation.returnDate)}</span>
                </div>
                <div>
                    <span className="font-medium">Pasażerów:</span><br />
                    <span className="text-gray-800">{reservation.passenger_count || 1} osób</span>
                </div>
                <div>
                    <span className="font-medium">Telefon:</span><br />
                    <span className="text-gray-800 font-mono">{formatPhoneNumber(reservation.phone_number) || 'Brak'}</span>
                </div>
                <div>
                    <span className="font-medium">Cena:</span><br />
                    <span className="text-green-600 font-bold">
                        {pricingSettings ? `${price} zł` : 'Ładowanie...'}
                    </span>
                </div>
            </div>

            {/* NUMER LOTU - bardziej kompaktowy */}
            {reservation.flightNumber && (
                <div className="bg-blue-50 px-3 py-2 rounded-lg mb-3 flex items-center justify-between">
                    <span className="text-blue-800 font-medium text-sm">✈️ Lot: {reservation.flightNumber}</span>
                    <button
                        onClick={handleFlightStatus}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                        Status lotu
                    </button>
                </div>
            )}

            {/* PRZYCISKI - kompaktowe, bez przycisku "Zapłacone" */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                {reservation.phone_number && (
                    <button
                        onClick={handleCall}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                        📞 Zadzwoń
                    </button>
                )}

                <button
                    onClick={() => onToggleComplete(reservation.id)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors text-sm ${
                        reservation.is_completed
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                >
                    {reservation.is_completed ? '🔄 Aktywuj' : '✅ Zakończ'}
                </button>

                <button
                    onClick={() => onEdit(reservation)}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                >
                    ✏️ Edytuj
                </button>

                <button
                    onClick={() => onDelete(reservation.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                    🗑️ Usuń
                </button>
            </div>
        </div>
    );
};

// Komponent główny ReservationList
const ReservationList = ({ reservations, onToggleComplete, onEdit, onDelete, onCheckFlight, onTogglePayment }) => {
    const { t } = useTranslation();

    if (!reservations || reservations.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('list.noReservations')}
                </h3>
                <p className="text-gray-600">
                    {t('list.addFirst')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reservations.map((item) => {
                // SPRAWDŹ czy to grupa wspólnej podróży
                if (item.isGroup) {
                    return (
                        <div key={item.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
                            {/* NAGŁÓWEK GRUPY */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-200">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-blue-500 text-white p-3 rounded-full">
                                        <span className="text-2xl">✈️</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-blue-800">
                                            Wspólna podróż - Lot {item.flightNumber}
                                        </h3>
                                        <p className="text-blue-600">
                                            📅 {new Date(item.reservations[0].returnDate).toLocaleDateString('pl-PL')} • 
                                            👥 {item.reservations.length} pasażerów
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                                    Grupa {item.reservations.length}
                                </div>
                            </div>
                            
                            {/* LISTA REZERWACJI W GRUPIE */}
                            <div className="space-y-3">
                                {item.reservations.map((reservation, index) => (
                                    <div key={reservation.id} className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <ReservationItem
                                                    reservation={reservation}
                                                    onToggleComplete={onToggleComplete}
                                                    onEdit={onEdit}
                                                    onDelete={onDelete}
                                                    onCheckFlight={onCheckFlight}
                                                    onTogglePayment={onTogglePayment}
                                                    isInGroup={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                } else {
                    // POJEDYNCZA REZERWACJA
                    return (
                        <ReservationItem
                            key={item.id}
                            reservation={item}
                            onToggleComplete={onToggleComplete}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onCheckFlight={onCheckFlight}
                            onTogglePayment={onTogglePayment}
                            isInGroup={false}
                        />
                    );
                }
            })}
        </div>
    );
};

export default ReservationList;
