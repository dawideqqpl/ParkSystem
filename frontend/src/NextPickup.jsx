// Plik: frontend/src/NextPickup.jsx
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

function NextPickup({ reservations }) {
    const { t } = useTranslation();

    const nextReservation = useMemo(() => {
        const now = new Date();
        return reservations
            .filter(res => new Date(res.returnDate) > now)
            .sort((a, b) => new Date(a.returnDate) - new Date(b.returnDate))[0];
    }, [reservations]);

    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!nextReservation) {
            setTimeLeft(null);
            return;
        }

        const intervalId = setInterval(() => {
            const now = new Date();
            const targetDate = new Date(nextReservation.returnDate);
            const difference = targetDate - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft(null);
                clearInterval(intervalId);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [nextReservation]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-md h-full flex flex-col">
            <h2 className="text-center text-sm font-semibold text-slate-500 mb-2">{t('timers.nextPickup')}</h2>
            {(!nextReservation || !timeLeft) ? (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-sm font-semibold text-slate-500">{t('timers.noUpcomingPickups')}</p>
                </div>
            ) : (
                <div className="text-center flex-grow flex flex-col justify-center">
                    <p className="font-mono text-2xl sm:text-4xl font-bold text-blue-600 tracking-wider">
                        {timeLeft.days > 0 && `${timeLeft.days}d `}
                        {padZero(timeLeft.hours)}:{padZero(timeLeft.minutes)}:{padZero(timeLeft.seconds)}
                    </p>
                    <div className="mt-1">
                        <p className="text-sm text-slate-700 truncate">
                            {nextReservation.customerName} ({nextReservation.licensePlate})
                        </p>
                        <p className="text-xs text-slate-500">
                            {t('timers.scheduled')}: {formatDateTime(nextReservation.returnDate)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NextPickup;
