// Plik: frontend/src/FlightStatusModal.jsx
import Spinner from './Spinner';
import { useTranslation } from 'react-i18next';

function FlightStatusModal({ isOpen, onClose, data, isLoading }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const colorClasses = {
    red: 'text-red-600',
    green: 'text-green-600',
    orange: 'text-orange-500',
    blue: 'text-blue-600',
    gray: 'text-slate-600',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t('modals.flightStatusTitle')}</h3>
          <button onClick={onClose} className="text-2xl font-bold leading-none hover:text-red-600">&times;</button>
        </div>
        {isLoading ? (
          <Spinner />
        ) : data ? (
          <div className="space-y-3">
            <p><strong>{t('list.flight')}:</strong> {data.flightNumber}</p>
            <p>
              <strong>{t('modals.flightStatus')}:</strong> 
              <span className={`font-bold ml-2 ${colorClasses[data.statusColor] || 'text-slate-600'}`}>
                {data.status}
              </span>
            </p>
            <hr className="my-3"/>
            <p><strong>{t('modals.scheduledTime')}:</strong> {data.scheduledTime || t('modals.noData')}</p>
            <p><strong>{t('modals.actualTime')}:</strong> {data.actualTime || t('modals.noData')}</p>
            <p><strong>{t('modals.terminal')}:</strong> {data.terminal || t('modals.noData')}</p>

            {data.trackingLink && (
              <a 
                href={data.trackingLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center bg-yellow-400 text-yellow-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition mt-4"
              >
                {t('modals.trackOnFlightradar')}
              </a>
            )}
          </div>
        ) : (
          <p>{t('list.noReservations')}</p>
        )}
      </div>
    </div>
  );
}

export default FlightStatusModal;
