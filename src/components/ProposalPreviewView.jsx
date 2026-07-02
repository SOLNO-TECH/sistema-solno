import React from 'react';
import { PreviewActionBar } from './PreviewActionBar';

export function ProposalPreviewView({ proposal, client, defaultTerms, onDownload, onClose }) {
  return (
    <>
      <PreviewActionBar
        title={`Vista previa — ${proposal.folio}`}
        onDownload={onDownload}
        onClose={onClose}
      />
      <div className="doc-preview-viewport flex justify-center overflow-x-auto pb-4">
        <div className="doc-preview-scale">
          <div
            id="proposal-document"
            className="bg-white text-black min-w-[800px] w-[800px] shadow-2xl print:shadow-none p-8 md:p-10 relative font-sans mx-auto"
            style={{ minHeight: '1035px' }}
          >
            <div className="flex justify-between items-start mb-6 border-b-2 border-black/10 pb-6">
              <div>
                <div className="mb-2">
                  <img src="/FONDO%20OSCURO.png" alt="Solno Logo" className="h-[80px] w-auto object-contain" crossOrigin="anonymous" />
                </div>
                <div className="text-sm text-gray-600 leading-relaxed max-w-xs">
                  <p>Calle 20 de Noviembre #7 Int. B,</p>
                  <p>Manzana 48, Lote 7B, C.P. 63737,</p>
                  <p>Mezcales, Bahía de Banderas, Nayarit, México.</p>
                  <p className="mt-2 font-medium">Tel: 329 296 5460 - 322 215 3935</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-4xl font-black text-black tracking-tighter uppercase">Esquema</h2>
                <p className="text-lg font-medium text-gray-500 mt-1">{proposal.folio}</p>
                <div className="mt-6 border border-gray-300 rounded-lg p-3 text-left block w-max ml-auto bg-white">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Fecha de Expedición</p>
                  <p className="font-bold text-black">
                    {new Date(proposal.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1 border-b border-gray-200 pb-1">Propuesto A</h3>
                {client ? (
                  <div>
                    <p className="font-bold text-lg">{client.firstName} {client.lastName}</p>
                    <p className="text-gray-600">{client.company || 'Particular'}</p>
                    <p className="text-sm text-gray-500 mt-1">{client.email}</p>
                    {client.phone && <p className="text-sm text-gray-500">{client.phone}</p>}
                  </div>
                ) : (
                  <p className="font-medium text-gray-500">Cliente General</p>
                )}
              </div>
              <div>
                <h3 className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1 border-b border-gray-200 pb-1">Proyecto</h3>
                <p className="font-bold text-lg text-[#8ca800]">{proposal.projectName}</p>
                {proposal.projectDesc && (
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{proposal.projectDesc}</p>
                )}
              </div>
            </div>

            <table className="w-full mb-6 text-sm table-fixed">
              <thead>
                <tr className="bg-black text-white">
                  <th className="py-2.5 px-3 font-bold rounded-tl-lg text-left" style={{ width: '28%' }}>Fase / Etapa</th>
                  <th className="py-2.5 px-3 font-bold text-left" style={{ width: '38%' }}>Entregables</th>
                  <th className="py-2.5 px-3 font-bold text-center" style={{ width: '18%' }}>Plazo</th>
                  <th className="py-2.5 px-3 font-bold text-right rounded-tr-lg" style={{ width: '16%' }}>Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {proposal.phases.map((phase, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                    <td className="py-3 px-3 align-top">
                      <span className="font-black" style={{ color: '#8ca800' }}>{String(idx + 1).padStart(2, '0')}.</span>{' '}
                      <span className="font-bold text-gray-900">{phase.name}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 align-top text-xs leading-relaxed whitespace-pre-line">{phase.deliverables || '—'}</td>
                    <td className="py-3 px-3 align-top text-center">
                      {phase.deadline ? (
                        <span className="text-xs font-medium text-gray-700 rounded-full px-2 py-0.5 bg-gray-100 inline-block">
                          {new Date(phase.deadline + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-900 align-top text-right">
                      ${phase.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-6">
              <div className="w-72">
                <div className="flex justify-between text-xl font-black pt-3 border-t-2 border-black">
                  <span>Total del Proyecto</span>
                  <span style={{ color: '#8ca800' }}>${proposal.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-3">Condiciones Generales</h4>
              <div className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{proposal.terms || defaultTerms}</div>
            </div>
          </div>
        </div>
      </div>
      <PreviewActionBar onDownload={onDownload} onClose={onClose} />
    </>
  );
}
