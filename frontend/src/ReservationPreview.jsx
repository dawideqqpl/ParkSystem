// Plik: frontend/src/ReservationPreview.jsx
import { useTranslation } from 'react-i18next';

const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const ReservationPreview = ({ reservation }) => {
    const { t } = useTranslation();

    if (!reservation) return null;

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold text-gray-900">{reservation.licensePlate}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reservation.is_completed 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                }`}>
                    {reservation.is_completed ? t('list.completed') : 'Aktywna'}
                </span>
            </div>

            {/* Customer name */}
            <p className="text-gray-700 font-medium mb-2">{reservation.customerName}</p>

            {/* Details in compact grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <div className="flex items-center mb-1">
                        <span className="w-4 h-4 mr-2">🕒</span>
                        <span className="text-gray-600">{formatDateTime(reservation.returnDate)}</span>
                    </div>
                    
                    {reservation.flightNumber && (
                        <div className="flex items-center mb-1">
                            <span className="w-4 h-4 mr-2">✈️</span>
                            <span className="text-blue-600 font-medium">{reservation.flightNumber}</span>
                        </div>
                    )}
                </div>

                <div>
                    {reservation.passenger_count && (
                        <div className="flex items-center mb-1">
                            <span className="w-4 h-4 mr-2">👥</span>
                            <span className="text-purple-600">{reservation.passenger_count} osób</span>
                        </div>
                    )}
                    
                    {reservation.price && (
                        <div className="flex items-center mb-1">
                            <span className="w-4 h-4 mr-2">💰</span>
                            <span className="text-green-600 font-semibold">{reservation.price} PLN</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReservationPreview;
