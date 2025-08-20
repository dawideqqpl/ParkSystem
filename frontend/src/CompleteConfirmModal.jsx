// Plik: frontend/src/CompleteConfirmModal.jsx
import { useTranslation } from 'react-i18next';

function CompleteConfirmModal({ isOpen, onClose, onConfirm, reservation }) {
  const { t } = useTranslation();

  if (!isOpen || !reservation) {
    return null;
  }

  const actionText = reservation.is_completed 
    ? t('modals.statusActive') 
    : t('modals.statusCompleted');
    
  const buttonClass = reservation.is_completed 
    ? "bg-blue-600 hover:bg-blue-700" 
    : "bg-green-600 hover:bg-green-700";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm mx-4">
        <h3 className="text-lg font-semibold mb-4">{t('modals.completeConfirmTitle')}</h3>
        <p className="text-slate-600 mb-4">
          {t('modals.completeConfirmMessage', { status: actionText })}
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-md p-3 mb-6">
            <p className="font-mono font-bold text-slate-800">{reservation.licensePlate}</p>
            <p className="text-sm text-slate-600">{reservation.customerName}</p>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 transition"
          >
            {t('form.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className={`text-white px-4 py-2 rounded-lg transition ${buttonClass}`}
          >
            Potwierdź
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompleteConfirmModal;
