export const ConfirmModal = ({ isOpen, title, text, confirmText, danger = true, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div className="glass-card" style={{ width: '400px', background: '#050a14', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ marginBottom: '1rem', color: danger ? '#ff4d4f' : 'var(--text-main)' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.5 }}>{text}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={danger ? "btn-danger" : "btn-primary"} onClick={onConfirm} style={{ 
              background: danger ? 'rgba(255, 77, 79, 0.1)' : 'var(--accent-primary)', 
              color: danger ? '#ff4d4f' : '#000', 
              border: danger ? '1px solid rgba(255,77,79,0.3)' : 'none',
              padding: '0.6rem 1.2rem' 
            }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
