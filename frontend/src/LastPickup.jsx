// Plik: frontend/src/LastPickup.jsx
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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

const padZero = (num) => num.toString().padStart(2, '0');

function LastPickup({ reservations }) {
    const { t } = useTranslation();

    const lastReservation = useMemo(() => {
        const now = new Date();
        return reservations
            .filter(res => new Date(res.returnDate) < now)
            .sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate))[0];
    }, [reservations]);

    const [timeSince, setTimeSince] = useState(null);

    useEffect(() => {
        if (!lastReservation) {
            setTimeSince(null);
            return;
        }

        const intervalId = setInterval(() => {
            const now = new Date();
            const targetDate = new Date(lastReservation.returnDate);
            const difference = now - targetDate;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeSince({ days, hours, minutes, seconds });
            } else {
                setTimeSince(null);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [lastReservation]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-md h-full flex flex-col">
            <h2 className="text-center text-sm font-semibold text-slate-500 mb-2">{t('timers.lastPickup')}</h2>
            {(!lastReservation || !timeSince) ? (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-sm font-semibold text-slate-500">{t('timers.noCompletedPickups')}</p>
                </div>
            ) : (
                <div className="text-center flex-grow flex flex-col justify-center">
                    <p className="font-mono text-2xl sm:text-4xl font-bold text-slate-600 tracking-wider">
                        {timeSince.days > 0 && `${timeSince.days}d `}
                        {padZero(timeSince.hours)}:{padZero(timeSince.minutes)}:{padZero(timeSince.seconds)}
                    </p>
                    <div className="mt-1">
                        <p className="text-sm text-slate-700 truncate">
                            {lastReservation.customerName} ({lastReservation.licensePlate})
                        </p>
                        <p className="text-xs text-slate-500">
                            {t('timers.completedAt')}: {formatDateTime(lastReservation.returnDate)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LastPickup;
