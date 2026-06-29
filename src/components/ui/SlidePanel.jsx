import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * SlidePanel – Premium right-side drawer for all registration forms.
 * Props:
 *   open        : boolean
 *   onClose     : () => void
 *   title       : string
 *   subtitle    : string
 *   icon        : React element (lucide icon)
 *   accentColor : tailwind class string for header accent (default brand)
 *   children    : form content
 */
export function SlidePanel({ open, onClose, title, subtitle, icon: Icon, accentColor = 'text-brand', children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="fixed right-0 top-20 z-50 flex flex-col rounded-tl-2xl rounded-bl-2xl overflow-hidden"
            style={{
              background: '#060606',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              width: '100%',
              maxWidth: '28rem',
              height: 'calc(100vh - 5rem)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.8)',
            }}
          >
            {/* ── Header with gradient background ── */}
            <div
              className="shrink-0 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(204,255,0,0.07) 0%, rgba(255,255,255,0.02) 60%, transparent 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {/* Subtle top-left glow */}
              <div
                className="absolute -top-6 -left-6 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: 'rgba(204,255,0,0.08)', filter: 'blur(32px)' }}
              />

              <div className="relative flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-4">
                  {Icon && (
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: 'rgba(204,255,0,0.08)',
                        border: '1px solid rgba(204,255,0,0.25)',
                        boxShadow: '0 0 16px rgba(204,255,0,0.12)',
                      }}
                    >
                      <Icon className={`w-5 h-5 ${accentColor}`} />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-extrabold text-white tracking-tight leading-tight">{title}</h2>
                    {subtitle && (
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">{subtitle}</p>
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

              {/* Neon accent bottom line */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ background: 'linear-gradient(to right, #ccff00, rgba(204,255,0,0.2), transparent)' }}
              />
            </div>

            {/* Scrollable form body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
