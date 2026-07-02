import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * SlidePanel – drawer de formularios. Portal en body para evitar overlays atrapados.
 */
export function SlidePanel({ open, onClose, title, subtitle, icon: Icon, accentColor = 'text-brand', children }) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="slide-panel-root"
          className="fixed inset-0 z-[200] fm-no-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 38 }}
            className={cn(
              'fm-no-transition absolute flex flex-col overflow-hidden',
              'inset-0 sm:inset-auto sm:right-0 sm:top-16 lg:top-20',
              'w-full sm:max-w-md',
              'h-full sm:h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]',
              'sm:rounded-tl-2xl sm:rounded-bl-2xl'
            )}
            style={{
              background: '#060606',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="shrink-0 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(204,255,0,0.07) 0%, rgba(255,255,255,0.02) 60%, transparent 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div
                className="absolute -top-6 -left-6 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: 'rgba(204,255,0,0.08)', filter: 'blur(32px)' }}
              />

              <div className="relative flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {Icon && (
                    <div
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: 'rgba(204,255,0,0.08)',
                        border: '1px solid rgba(204,255,0,0.25)',
                        boxShadow: '0 0 16px rgba(204,255,0,0.12)',
                      }}
                    >
                      <Icon className={`w-5 h-5 ${accentColor}`} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight truncate">{title}</h2>
                    {subtitle && (
                      <p className="text-xs text-gray-500 mt-0.5 font-medium truncate">{subtitle}</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 bg-white/[0.04] border border-white/[0.08] text-white/40 hover:bg-white/[0.08] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ background: 'linear-gradient(to right, #ccff00, rgba(204,255,0,0.2), transparent)' }}
              />
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
