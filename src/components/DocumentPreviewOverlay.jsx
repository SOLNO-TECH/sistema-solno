import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Printer, X } from 'lucide-react';

const TOP = 56;
const BOTTOM = 84;

/**
 * Overlay de vista previa — barras fijas con estilos inline (no dependen de Tailwind en producción).
 */
export function DocumentPreviewOverlay({ open, onClose, title, subtitle, onDownload, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const btnBase = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    padding: '0 16px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    border: 'none',
    gap: 6,
    flex: 1,
    minWidth: 0,
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483646,
        background: 'rgba(0,0,0,0.96)',
      }}
    >
      {/* Barra superior */}
      <div
        className="preview-chrome"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2147483647,
          padding: '10px 16px',
          background: '#0a0a0a',
          borderBottom: '2px solid #ccff00',
          boxShadow: '0 4px 24px rgba(0,0,0,0.8)',
        }}
      >
        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#fff' }}>{title}</p>
        {subtitle && (
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888' }}>{subtitle}</p>
        )}
      </div>

      {/* Documento */}
      <div
        style={{
          position: 'fixed',
          top: TOP,
          bottom: BOTTOM,
          left: 0,
          right: 0,
          overflow: 'auto',
          padding: '16px 8px',
        }}
      >
        {children}
      </div>

      {/* Barra inferior — botones grandes siempre visibles */}
      <div
        className="preview-chrome"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2147483647,
          padding: '12px 12px max(12px, env(safe-area-inset-bottom))',
          background: '#0a0a0a',
          borderTop: '3px solid #ccff00',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.9)',
          display: 'flex',
          gap: 8,
        }}
      >
        <button type="button" onClick={onDownload} style={{ ...btnBase, background: '#ccff00', color: '#000' }}>
          <Download size={18} />
          Descargar PDF
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          style={{ ...btnBase, background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
        >
          <Printer size={18} />
          Imprimir
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{ ...btnBase, flex: '0 0 auto', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', padding: '0 20px' }}
        >
          <X size={18} />
          Salir
        </button>
      </div>
    </div>,
    document.body
  );
}
