import React from 'react';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Button } from './ui/Button';

export function PreviewActionBar({ title, onDownload, onClose }) {
  return (
    <div
      role="toolbar"
      aria-label="Acciones de vista previa"
      className="preview-action-bar sticky top-0 z-50 mb-5 rounded-xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md shadow-corporate"
    >
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5">
        {title && (
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Vista previa</p>
            <p className="truncate text-sm font-semibold text-white sm:text-base">{title.replace(/^Vista previa —\s*/, '')}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Button
            type="button"
            onClick={onDownload}
            className="h-9 bg-brand px-4 text-xs font-bold text-black hover:bg-brand/90 hover:shadow-glow sm:text-sm"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Descargar PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
            className="h-9 border-white/15 px-4 text-xs text-gray-300 hover:border-white/25 hover:bg-white/5 hover:text-white sm:text-sm"
          >
            <Printer className="mr-1.5 h-4 w-4" />
            Imprimir
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-9 px-4 text-xs text-gray-400 hover:bg-white/5 hover:text-white sm:text-sm"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Volver
          </Button>
        </div>
      </div>
    </div>
  );
}
