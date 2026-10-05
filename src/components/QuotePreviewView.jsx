import React from 'react';
import { PreviewActionBar } from './PreviewActionBar';

export function QuotePreviewView({ quote, client, defaultTerms, onDownload, onClose }) {
  return (
    <>
      <PreviewActionBar
        title={quote.folio}
        onDownload={onDownload}
        onClose={onClose}
      />
      <div className="doc-preview-viewport flex justify-center overflow-x-auto pb-4">
        <div className="doc-preview-scale">
          <div
            id="quote-document"
            className="text-black w-[800px] min-w-[800px] shadow-2xl print:shadow-none relative font-sans mx-auto bg-white"
            style={{ minHeight: '1035px' }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[210px] overflow-hidden" aria-hidden="true">
              <img src="/hoja.jpg" alt="" className="w-full select-none" style={{ height: '1035px', objectFit: 'fill' }} />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[172px] overflow-hidden" aria-hidden="true">
              <img
                src="/hoja.jpg"
                alt=""
                className="absolute bottom-0 w-full select-none"
                style={{ height: '1035px', objectFit: 'fill' }}
              />
            </div>
            <div className="relative z-10 px-10 flex flex-col" style={{ paddingTop: '220px', paddingBottom: '196px' }}>
              <div className="absolute top-[148px] right-10 text-right">
                <p className="text-base font-black text-gray-900 tracking-wide">{quote.folio}</p>
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.18em] mt-1 mb-0.5">Fecha de expedición</p>
                <p className="text-xs font-semibold text-gray-700">
                  {new Date(quote.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-10">
                <div>
                  <h3 className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.18em] mb-1.5 pb-1 border-b-2 border-[#8ca800]/40">Cotizado a</h3>
                  {client ? (
                    <div className="space-y-0">
                      <p className="font-bold text-sm text-gray-900">{client.firstName} {client.lastName}</p>
                      <p className="text-xs text-gray-600 font-medium">{client.company || 'Particular'}</p>
                      {client.email && <p className="text-[10px] text-gray-500 mt-1">{client.email}</p>}
                      {client.phone && <p className="text-[10px] text-gray-500">{client.phone}</p>}
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-gray-500">Cliente General</p>
                  )}
                </div>
                <div>
                  <h3 className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.18em] mb-1.5 pb-1 border-b-2 border-[#8ca800]/40">Proyecto / Servicio</h3>
                  <p className="font-bold text-sm text-[#6d8f00]">{quote.projectType}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-md overflow-hidden mb-3 shadow-sm shrink-0">
                <table className="quote-items-table w-full text-xs border-collapse" style={{ tableLayout: 'fixed', width: '100%' }}>
                  <colgroup>
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '49%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '20%' }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="py-2 px-2 font-bold text-[10px] uppercase tracking-wide">Cantidad</th>
                      <th className="py-2 px-2 font-bold text-[10px] uppercase tracking-wide">Descripción</th>
                      <th className="py-2 px-2 font-bold text-[10px] uppercase tracking-wide">P. Unitario</th>
                      <th className="py-2 px-2 font-bold text-[10px] uppercase tracking-wide">Importe</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {(quote.items || []).map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-200 last:border-b-0">
                        <td className="py-2 px-2 font-medium text-gray-800 tabular-nums">{item.qty}</td>
                        <td className="py-2 px-2 font-medium text-gray-900 leading-snug break-words whitespace-normal">{item.desc}</td>
                        <td className="py-2 px-2 text-gray-700 tabular-nums">${parseFloat(item.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 px-2 font-semibold text-gray-900 tabular-nums">${(item.qty * item.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-3 shrink-0">
                <div className="w-60 overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm">
                  <div className="px-4 py-2.5 space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span className="uppercase text-[9px] font-semibold tracking-wider text-gray-500">Subtotal</span>
                      <span className="font-medium tabular-nums text-gray-800">${(quote.subtotal || quote.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span className="uppercase text-[9px] font-semibold tracking-wider text-gray-500">IVA (16%)</span>
                      <span className="font-medium tabular-nums text-gray-800">${(quote.iva || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-black text-white px-4 py-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em]">Total</span>
                    <span className="text-lg font-black tabular-nums tracking-tight">${(quote.total || quote.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 bg-white border border-gray-200 rounded-md px-4 py-3 shadow-sm border-l-4 border-l-[#8ca800]">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-800 mb-1.5">Condiciones y formas de pago</h4>
                <div className="space-y-1 text-[11px] text-gray-800 break-words" style={{ lineHeight: '1.45', letterSpacing: 'normal' }}>
                  {(quote.terms || defaultTerms)
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line, i) => (
                      <p key={i} className="m-0">{line}</p>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
