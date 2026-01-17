import './ConfirmModal.css';

function ConfirmModal({ isOpen, onConfirm, onCancel, title, message, isDarkMode }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div 
        className={`modal-content ${isDarkMode ? 'dark-mode' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <button onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button onClick={onConfirm} className="confirm-btn">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
