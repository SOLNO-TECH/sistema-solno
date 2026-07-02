import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * SlidePanel – Premium right-side drawer for all registration forms.
 * Full-screen on mobile, side drawer on sm+.
 */
export function SlidePanel({ open, onClose, title, subtitle, icon: Icon, accentColor = 'text-brand', children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className={cn(
              'fixed z-50 flex flex-col overflow-hidden',
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
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                  }}
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
        </>
      )}
    </AnimatePresence>
  );
}
