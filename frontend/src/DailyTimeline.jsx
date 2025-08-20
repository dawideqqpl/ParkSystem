// Plik: frontend/src/DailyTimeline.jsx
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';

// POPRAWIONA FUNKCJA - zmieniony props z pickups na reservations + zabezpieczenia
function DailyTimeline({ reservations = [] }) { // ZMIENIONO z pickups na reservations + domyślna wartość
    const { t } = useTranslation();
    const [currentTimePosition, setCurrentTimePosition] = useState(0);

    // DODANE ZABEZPIECZENIE
    const safeReservations = Array.isArray(reservations) ? reservations : [];

    const getPosition = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const totalMinutes = hours * 60 + minutes;
        return (totalMinutes / 1440) * 100;
    };

    useEffect(() => {
        const updateCurrentTime = () => {
            setCurrentTimePosition(getPosition(new Date()));
        };

        updateCurrentTime();
        const interval = setInterval(updateCurrentTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ZAKTUALIZOWANA LOGIKA GRUPOWANIA - używa safeReservations
    const clusteredPickups = useMemo(() => {
        if (safeReservations.length === 0) { // ZMIENIONO z pickups na safeReservations
            return [];
        }

        // Sortujemy odbiory chronologicznie
        const sortedPickups = [...safeReservations].sort((a, b) => 
            new Date(a.returnDate) - new Date(b.returnDate)
        );

        const clusters = [];
        let currentCluster = [sortedPickups[0]];

        for (let i = 1; i < sortedPickups.length; i++) {
            const lastPickupInCluster = currentCluster[currentCluster.length - 1];
            const currentPickup = sortedPickups[i];
            const lastTime = new Date(lastPickupInCluster.returnDate).getTime();
            const currentTime = new Date(currentPickup.returnDate).getTime();

            // Jeśli różnica czasu jest mniejsza niż 15 minut, dodaj do tej samej grupy
            if ((currentTime - lastTime) < (15 * 60 * 1000)) {
                currentCluster.push(currentPickup);
            } else {
                // W przeciwnym razie, zakończ starą grupę i zacznij nową
                clusters.push(currentCluster);
                currentCluster = [currentPickup];
            }
        }

        // Dodaj ostatnią utworzoną grupę
        clusters.push(currentCluster);
        return clusters;
    }, [safeReservations]); // ZMIENIONO dependency

    const hours = [0, 3, 6, 9, 12, 15, 18, 21, 24];

    // DODANE SPRAWDZENIE CZY SĄ DANE
    if (safeReservations.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('timers.nextPickup') || 'Dzisiejsze odbiory'}
                </h3>
                <div className="text-center py-8">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-gray-600">Brak odbiorów na dzisiaj</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('timers.nextPickup') || 'Oś czasu - dzisiejsze odbiory'}
            </h3>
            
            <div className="relative">
                {/* Linia czasu */}
                <div className="relative h-16 bg-gray-100 rounded-lg mb-4">
                    {/* Znaczniki godzin */}
                    {hours.map(hour => (
                        <div
                            key={hour}
                            className="absolute top-0 h-full flex flex-col justify-between"
                            style={{ left: `${(hour / 24) * 100}%` }}
                        >
                            <div className="w-px h-full bg-gray-300"></div>
                            <span className="text-xs text-gray-500 mt-1 -translate-x-1/2">
                                {hour === 24 ? '00' : String(hour).padStart(2, '0')}:00
                            </span>
                        </div>
                    ))}

                    {/* Aktualna godzina */}
                    <div
                        className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
                        style={{ left: `${currentTimePosition}%` }}
                    >
                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full"></div>
                        <span className="absolute -top-8 -left-8 text-xs text-red-600 font-medium whitespace-nowrap">
                            Teraz
                        </span>
                    </div>

                    {/* Odbiory */}
                    {clusteredPickups.map((cluster, clusterIndex) => {
                        const clusterTime = new Date(cluster[0].returnDate);
                        const position = getPosition(clusterTime);
                        
                        return (
                            <div
                                key={clusterIndex}
                                className="absolute top-2 transform -translate-x-1/2"
                                style={{ left: `${position}%` }}
                            >
                                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg min-w-max">
                                    <div className="font-medium mb-1">
                                        {formatTime(cluster[0].returnDate)}
                                    </div>
                                    {cluster.map((pickup, pickupIndex) => (
                                        <div key={pickup.id || pickupIndex} className="text-xs">
                                            <div>{pickup.customerName}</div>
                                            <div className="text-blue-200">{pickup.licensePlate}</div>
                                        </div>
                                    ))}
                                    {cluster.length > 1 && (
                                        <div className="text-blue-200 text-xs mt-1">
                                            +{cluster.length - 1} więcej
                                        </div>
                                    )}
                                </div>
                                {/* Linia łącząca z osią czasu */}
                                <div className="w-px h-2 bg-blue-500 mx-auto"></div>
                            </div>
                        );
                    })}
                </div>

                {/* Legenda */}
                <div className="flex justify-between items-center text-sm text-gray-600 mt-4">
                    <span>🔴 Aktualna godzina</span>
                    <span>🔵 Planowane odbiory</span>
                    <span>Łącznie: {safeReservations.length} odbiorów</span>
                </div>
            </div>
        </div>
    );
}

export default DailyTimeline;
