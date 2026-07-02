import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Printer, X } from 'lucide-react';
import { Button } from './ui/Button';

/**
 * Overlay de vista previa PDF — barras fijas arriba y abajo, siempre visibles.
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

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/92 fm-no-transition"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Barra superior — título */}
      <div className="preview-chrome fixed top-0 left-0 right-0 z-[10001] bg-[#0d0d0d] border-b border-brand/30 px-4 py-3 shadow-lg">
        <p className="text-sm font-bold text-white truncate">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Documento — área con scroll entre las barras */}
      <div className="fixed top-[58px] bottom-[76px] left-0 right-0 overflow-auto doc-preview-viewport px-2 sm:px-4 py-4">
        {children}
      </div>

      {/* Barra inferior — acciones siempre visibles */}
      <div className="preview-chrome fixed bottom-0 left-0 right-0 z-[10001] bg-[#0d0d0d] border-t border-brand/30 px-3 sm:px-4 py-3 flex gap-2 shadow-[0_-12px_40px_rgba(0,0,0,0.9)]">
        <Button
          type="button"
          onClick={onDownload}
          className="flex-1 min-w-0 bg-brand text-black font-bold h-11 text-xs sm:text-sm"
        >
          <Download className="w-4 h-4 mr-1.5 shrink-0" />
          Descargar PDF
        </Button>
        <Button
          type="button"
          onClick={() => window.print()}
          className="flex-1 min-w-0 bg-white/10 text-white border border-white/20 font-bold h-11 text-xs sm:text-sm"
        >
          <Printer className="w-4 h-4 mr-1.5 shrink-0" />
          Imprimir
        </Button>
        <Button
          type="button"
          onClick={onClose}
          className="shrink-0 bg-white/5 text-white border border-white/20 font-bold h-11 px-3 sm:px-4"
        >
          <X className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Salir</span>
        </Button>
      </div>
    </div>,
    document.body
  );
}
