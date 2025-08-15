// Plik: frontend/src/ConfirmModal.jsx

function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) {
    return null;
  }

  return (
    // Półprzezroczyste tło
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* Okno modala */}
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm mx-4">
        <h3 className="text-lg font-semibold mb-4">Potwierdzenie</h3>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 transition"
          >
            Anuluj
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Potwierdź
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;