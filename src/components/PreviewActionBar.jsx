import React from 'react';

const BTN = {
  flex: '1 1 140px',
  height: 52,
  fontWeight: 900,
  fontSize: 14,
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
};

export function PreviewActionBar({ title, onDownload, onClose }) {
  return (
    <div
      role="toolbar"
      aria-label="Acciones de vista previa"
      className="preview-action-bar"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        padding: '14px 16px',
        background: '#ccff00',
        borderRadius: 12,
        border: '3px solid #ffffff',
        boxShadow: '0 0 30px rgba(204, 255, 0, 0.45)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        marginBottom: 16,
      }}
    >
      <button type="button" onClick={onDownload} style={{ ...BTN, background: '#000000', color: '#ccff00' }}>
        ⬇ DESCARGAR PDF
      </button>
      <button type="button" onClick={() => window.print()} style={{ ...BTN, background: '#111111', color: '#ffffff' }}>
        🖨 IMPRIMIR
      </button>
      <button type="button" onClick={onClose} style={{ ...BTN, background: '#dc2626', color: '#ffffff' }}>
        ✕ VOLVER AL LISTADO
      </button>
      {title && (
        <p style={{ width: '100%', margin: '4px 0 0', fontSize: 13, fontWeight: 700, color: '#111111', textAlign: 'center' }}>
          {title}
        </p>
      )}
    </div>
  );
}
