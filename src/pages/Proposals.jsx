import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SlidePanel } from '../components/ui/SlidePanel';
import { getStorageData, setStorageData } from '../lib/utils';
import { Plus, Trash2, ClipboardList, Download, Printer, X, Eye, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';

const LABEL = 'text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block';
const FIELD = 'bg-black/60 border-white/10 text-white placeholder:text-white/20';
const SEL   = 'flex h-9 w-full rounded-md border border-white/10 bg-black/60 px-3 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand';

const STATUS_COLORS = {
  'Borrador':  'bg-white/5 text-gray-400 border-white/10',
  'Enviada':   'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Aprobada':  'bg-brand/10 text-brand border-brand/30',
  'Rechazada': 'bg-danger/10 text-danger border-danger/30',
};

const DEFAULT_TERMS = `• La propuesta tiene una vigencia de 30 días naturales a partir de su fecha de expedición.\n• Los plazos de cada fase inician a partir de la confirmación formal del proyecto y el pago del anticipo correspondiente.\n• Cualquier modificación al alcance del proyecto deberá ser aprobada por ambas partes y puede implicar ajustes en costos y tiempos.\n• Todos nuestros desarrollos incluyen 1 mes de garantía sin costo adicional al finalizar el proyecto.`;

export function Proposals() {
  const [proposals, setProposals]   = useState([]);
  const [clients, setClients]       = useState([]);
  const [panelOpen, setPanelOpen]   = useState(false);

  // Form state
  const [clientId, setClientId]         = useState('');
  const [projectName, setProjectName]   = useState('');
  const [projectDesc, setProjectDesc]   = useState('');
  const [status, setStatus]             = useState('Borrador');
  const [phases, setPhases]             = useState([{ id: Date.now(), name: '', deliverables: '', deadline: '', price: '' }]);
  const [terms, setTerms]               = useState(DEFAULT_TERMS);

  const [confirmDelete, setConfDel]   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [viewProposal, setViewProposal] = useState(null);

  useEffect(() => {
    const load = async () => {
      setProposals(await getStorageData('solno_proposals', []));
      setClients(await getStorageData('solno_clients', []));
    };
    load();
  }, []);

  const resetForm = () => {
    setClientId('');
    setProjectName('');
    setProjectDesc('');
    setStatus('Borrador');
    setPhases([{ id: Date.now(), name: '', deliverables: '', deadline: '', price: '' }]);
    setTerms(DEFAULT_TERMS);
  };

  const generateFolio = (list) => {
    const maxId = list.length > 0 ? Math.max(...list.map(p => {
      const parts = p.folio ? p.folio.split('-') : [];
      return parts.length === 2 ? parseInt(parts[1], 10) : 0;
    })) : 0;
    return `ESQUE-${(maxId + 1).toString().padStart(4, '0')}`;
  };

  const calculateTotal = (phasesArr) =>
    phasesArr.reduce((acc, p) => acc + parseFloat(p.price || 0), 0);

  const handleAddPhase = () =>
    setPhases([...phases, { id: Date.now(), name: '', deliverables: '', deadline: '', price: '' }]);

  const handleRemovePhase = (id) =>
    setPhases(phases.filter(p => p.id !== id));

  const handlePhaseChange = (id, field, value) =>
    setPhases(phases.map(p => p.id === id ? { ...p, [field]: value } : p));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) { toast.error('Escribe el nombre del proyecto.'); return; }
    if (phases.some(p => !p.name || p.price === '')) { toast.error('Completa el nombre y precio de todas las fases.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 380));

    const total = calculateTotal(phases);
    const newProposal = {
      id: Date.now(),
      folio: generateFolio(proposals),
      clientId: clientId ? parseInt(clientId) : null,
      projectName,
      projectDesc,
      status,
      phases: phases.map(p => ({ ...p, price: parseFloat(p.price) })),
      total,
      terms,
      date: new Date().toISOString(),
    };

    const updated = [...proposals, newProposal];
    setProposals(updated);
    await setStorageData('solno_proposals', updated);
    window.dispatchEvent(new Event('solno_data_updated'));
    setLoading(false);
    resetForm();
    setPanelOpen(false);
    toast.success('Propuesta generada', { description: `${newProposal.folio} registrada exitosamente.` });
  };

  const handleDelete = async (id) => {
    const updated = proposals.filter(p => p.id !== id);
    setProposals(updated);
    await setStorageData('solno_proposals', updated);
    window.dispatchEvent(new Event('solno_data_updated'));
    setConfDel(null);
    toast.error('Propuesta eliminada');
  };

  const totalSum = proposals.reduce((acc, p) => acc + (p.total || 0), 0);

  // ── PDF PREVIEW ──────────────────────────────────────────────────────────────
  if (viewProposal) {
    const linkedClient = clients.find(c => c.id === viewProposal.clientId);
    return (
      <div
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex justify-center overflow-y-auto print:bg-white print:static print:block"
        onClick={() => setViewProposal(null)}
      >
        <div
          className="min-h-screen py-10 print:py-0 px-4 w-full overflow-x-auto pb-32"
          onClick={e => e.stopPropagation()}
        >
          {/* Action Bar */}
          <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-3 no-print z-[200] px-4 pointer-events-none">
            <div className="flex gap-2 sm:gap-3 pointer-events-auto bg-black/80 backdrop-blur-xl p-2 sm:p-3 rounded-2xl border border-white/10 shadow-2xl">
              <Button
                onClick={() => {
                  const element = document.getElementById('proposal-document');
                  if (element) {
                    toast('Generando PDF...', { description: 'Por favor espera unos segundos.' });
                    html2pdf().set({
                      margin: 0.2,
                      filename: `${viewProposal.folio}.pdf`,
                      image: { type: 'jpeg', quality: 0.98 },
                      html2canvas: { scale: 2, useCORS: true, logging: true },
                      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                    }).from(element).save().then(() => toast.success('Descargado correctamente'));
                  }
                }}
                className="bg-brand text-black font-bold hover:shadow-glow shadow-lg px-4 sm:px-6"
              >
                <Download className="w-4 h-4 mr-2" /> Descargar PDF
              </Button>
              <Button
                onClick={() => window.print()}
                className="bg-white/10 text-white font-bold hover:bg-white/20 shadow-lg border border-white/10 hidden sm:flex px-6"
              >
                <Printer className="w-4 h-4 mr-2" /> Imprimir
              </Button>
              <Button
                onClick={() => setViewProposal(null)}
                variant="outline"
                className="bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/10 shadow-none px-3"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* ── Paper Document ──────────────────────────────────────────────── */}
          <div
            id="proposal-document"
            className="bg-white text-black min-w-[800px] w-[800px] shadow-2xl print:shadow-none p-8 md:p-10 relative font-sans mx-auto"
            style={{ minHeight: '1035px' }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6 border-b-2 border-black/10 pb-6">
              <div>
                <div className="mb-2">
                  <img
                    src="/logo.png?v=new3"
                    alt="Solno Logo"
                    className="h-[200px] w-auto object-contain"
                    crossOrigin="anonymous"
                    style={{ height: '200px', objectFit: 'contain' }}
                  />
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
                <p className="text-lg font-medium text-gray-500 mt-1">{viewProposal.folio}</p>
                <div className="mt-6 border border-gray-300 rounded-lg p-3 text-left block w-max ml-auto bg-white">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Fecha de Expedición</p>
                  <p className="font-bold text-black">
                    {new Date(viewProposal.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Client + Project Info */}
            <div className="mb-6 grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1 border-b border-gray-200 pb-1">Propuesto A</h3>
                {linkedClient ? (
                  <div>
                    <p className="font-bold text-lg">{linkedClient.firstName} {linkedClient.lastName}</p>
                    <p className="text-gray-600">{linkedClient.company || 'Particular'}</p>
                    <p className="text-sm text-gray-500 mt-1">{linkedClient.email}</p>
                    {linkedClient.phone && <p className="text-sm text-gray-500">{linkedClient.phone}</p>}
                  </div>
                ) : (
                  <p className="font-medium text-gray-500">Cliente General</p>
                )}
              </div>
              <div>
                <h3 className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1 border-b border-gray-200 pb-1">Proyecto</h3>
                <p className="font-bold text-lg text-[#8ca800]">{viewProposal.projectName}</p>
                {viewProposal.projectDesc && (
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{viewProposal.projectDesc}</p>
                )}
              </div>
            </div>

            {/* Phases Table */}
            <table className="w-full mb-6 text-sm table-fixed">
              <thead>
                <tr className="bg-black text-white">
                  <th className="py-2.5 px-3 font-bold rounded-tl-lg text-left" style={{ width: '28%' }}>
                    <div style={{ display: 'block' }}>Fase / Etapa</div>
                  </th>
                  <th className="py-2.5 px-3 font-bold text-left" style={{ width: '38%' }}>
                    <div style={{ display: 'block' }}>Entregables</div>
                  </th>
                  <th className="py-2.5 px-3 font-bold text-center" style={{ width: '18%' }}>
                    <div style={{ display: 'block', textAlign: 'center' }}>Plazo</div>
                  </th>
                  <th className="py-2.5 px-3 font-bold text-right rounded-tr-lg" style={{ width: '16%' }}>
                    <div style={{ display: 'block', textAlign: 'right' }}>Pago</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {viewProposal.phases.map((phase, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                    <td className="py-3 px-3 align-top">
                      <span className="font-black" style={{ color: '#8ca800' }}>{String(idx + 1).padStart(2, '0')}.</span>{' '}
                      <span className="font-bold text-gray-900">{phase.name}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 align-top text-xs leading-relaxed whitespace-pre-line">
                      {phase.deliverables || '—'}
                    </td>
                    <td className="py-3 px-3 align-top" style={{ textAlign: 'center' }}>
                      {phase.deadline ? (
                        <span
                          className="text-xs font-medium text-gray-700 rounded-full px-2 py-0.5"
                          style={{ backgroundColor: '#f3f4f6', display: 'inline-block' }}
                        >
                          {new Date(phase.deadline + 'T12:00:00').toLocaleDateString('es-MX', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-900 align-top" style={{ textAlign: 'right' }}>
                      ${phase.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className="flex justify-end mb-6">
              <div className="w-72">
                <div className="flex justify-between text-xl font-black pt-3 border-t-2 border-black">
                  <span>Total del Proyecto</span>
                  <span style={{ color: '#8ca800' }}>
                    ${viewProposal.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mt-auto">
              <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-3">Condiciones Generales</h4>
              <div className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">
                {viewProposal.terms || DEFAULT_TERMS}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 relative">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-brand" /> Propuestas
          </h1>
          <p className="text-gray-400 mt-2">Crea propuestas comerciales con fases, entregables y plazos de entrega.</p>
        </div>
        <Button
          onClick={() => { resetForm(); setPanelOpen(true); }}
          className="bg-brand text-black hover:bg-brand/90 hover:shadow-glow font-bold shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" /> Nueva Propuesta
        </Button>
      </div>

      <Card className="glass border-white/5">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white font-bold">Historial de Propuestas</CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-brand" />
                <span className="text-sm font-bold text-brand">
                  ${totalSum.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <span className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-400">
                {proposals.length} registros
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {proposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ClipboardList className="w-14 h-14 text-white/8 mb-4" />
              <p className="text-white font-medium">Sin propuestas registradas</p>
              <p className="text-sm text-gray-500 mt-1 mb-4">Crea tu primera propuesta comercial con esquema de fases.</p>
              <Button onClick={() => setPanelOpen(true)} className="bg-brand text-black font-bold hover:shadow-glow">
                <Plus className="w-4 h-4 mr-2" /> Crear Propuesta
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              <AnimatePresence>
                {[...proposals].reverse().map(proposal => {
                  const linkedClient = clients.find(c => c.id === proposal.clientId);
                  return (
                    <motion.div
                      key={proposal.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-white/2 group gap-4"
                    >
                      <div
                        className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                        onClick={() => setViewProposal(proposal)}
                      >
                        <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                          <ClipboardList className="w-4 h-4 text-brand" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-brand">{proposal.folio}</span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${STATUS_COLORS[proposal.status] || STATUS_COLORS['Borrador']}`}>
                              {proposal.status}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-white truncate">{proposal.projectName}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <span className="text-xs text-gray-500">
                              {new Date(proposal.date).toLocaleDateString('es-MX')}
                            </span>
                            {linkedClient && (
                              <span className="text-xs text-gray-500">
                                {linkedClient.firstName} {linkedClient.lastName}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {proposal.phases.length} fase{proposal.phases.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 sm:ml-4">
                        <span className="text-base font-bold text-white">
                          ${proposal.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            onClick={() => setViewProposal(proposal)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-2 h-auto opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Ver / Imprimir"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {confirmDelete === proposal.id ? (
                            <div className="flex items-center gap-1">
                              <Button size="sm" onClick={() => handleDelete(proposal.id)} className="bg-danger text-white h-8 px-2 text-xs">Sí</Button>
                              <Button size="sm" variant="ghost" onClick={() => setConfDel(null)} className="text-gray-400 h-8 px-2 text-xs">No</Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => setConfDel(proposal.id)}
                              className="text-white/15 hover:text-danger hover:bg-danger/10 p-2 h-auto opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── CREATION PANEL ──────────────────────────────────────────────────────── */}
      <SlidePanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title="Nueva Propuesta Comercial"
        subtitle="Esquema de Fases, Plazos y Entregables"
        icon={ClipboardList}
        accentColor="text-brand"
      >
        <form onSubmit={handleAdd} className="space-y-6 pb-6">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Vincular a Cliente</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} className={SEL}>
                <option value="">— Cliente General —</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL}>Estado</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className={SEL}>
                <option>Borrador</option>
                <option>Enviada</option>
                <option>Aprobada</option>
                <option>Rechazada</option>
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL}>Nombre del Proyecto</label>
            <Input
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="Ej. Sistema de Gestión Empresarial"
              className={FIELD}
              required
            />
          </div>

          <div>
            <label className={LABEL}>Descripción General (opcional)</label>
            <textarea
              value={projectDesc}
              onChange={e => setProjectDesc(e.target.value)}
              placeholder="Breve descripción del proyecto o alcance general..."
              className="flex w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-brand resize-none min-h-[60px]"
            />
          </div>

          {/* Phases */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-white">Fases del Proyecto</label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddPhase}
                className="h-7 text-xs border-brand/30 text-brand hover:bg-brand/10"
              >
                <Plus className="w-3 h-3 mr-1" /> Añadir Fase
              </Button>
            </div>

            <div className="space-y-4">
              {phases.map((phase, idx) => (
                <div key={phase.id} className="bg-black/40 border border-white/10 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-brand/70 uppercase">Fase {idx + 1}</span>
                    {phases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhase(phase.id)}
                        className="ml-auto w-6 h-6 flex items-center justify-center text-white/20 hover:text-danger"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <Input
                    value={phase.name}
                    onChange={e => handlePhaseChange(phase.id, 'name', e.target.value)}
                    placeholder="Nombre de la fase (ej. Diseño UI/UX)"
                    className={`${FIELD} h-8 text-sm`}
                    required
                  />
                  <textarea
                    value={phase.deliverables}
                    onChange={e => handlePhaseChange(phase.id, 'deliverables', e.target.value)}
                    placeholder="Entregables (uno por línea)"
                    className="flex w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-brand resize-none min-h-[56px]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Plazo (fecha límite)</label>
                      <Input
                        type="date"
                        value={phase.deadline}
                        onChange={e => handlePhaseChange(phase.id, 'deadline', e.target.value)}
                        className={`${FIELD} h-8 text-sm`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Precio (MXN)</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={phase.price}
                        onChange={e => handlePhaseChange(phase.id, 'price', e.target.value)}
                        placeholder="0.00"
                        className={`${FIELD} h-8 text-sm`}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Total */}
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
              <p className="text-sm font-bold text-brand">
                Total: <span className="ml-2">${calculateTotal(phases).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </p>
            </div>
          </div>

          <div>
            <label className={LABEL}>Condiciones Generales</label>
            <textarea
              value={terms}
              onChange={e => setTerms(e.target.value)}
              className="flex w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-brand resize-none min-h-[100px]"
              required
            />
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-[#0a0a0a] pb-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPanelOpen(false)}
              className="flex-1 border border-white/10 text-gray-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-brand text-black hover:bg-brand/90 font-bold hover:shadow-glow"
            >
              {loading
                ? <span className="animate-pulse">Generando...</span>
                : <><ClipboardList className="w-4 h-4 mr-1.5" />Guardar Propuesta</>
              }
            </Button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}
