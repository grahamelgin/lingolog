import './ConfirmModal.css';

function AddLanguageModal({ isOpen, onConfirm, onCancel, isDarkMode, value, onChange }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(e);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div 
        className={`modal-content ${isDarkMode ? 'dark-mode' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Add New Language</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              value={value}
              onChange={onChange}
              placeholder="e.g., Spanish, Japanese"
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: isDarkMode ? '2px solid #555' : '2px solid #e0e0e0',
                borderRadius: '8px',
                background: isDarkMode ? '#3d3d3d' : 'white',
                color: isDarkMode ? '#e0e0e0' : '#333',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <div className="modal-buttons">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="confirm-btn success">
              Add Language
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddLanguageModal;
