import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SlidePanel } from '../components/ui/SlidePanel';
import { getStorageData, setStorageData } from '../lib/utils';
import { Plus, Trash2, FileText, Link as LinkIcon, DollarSign, Printer, X, Eye, Globe, Monitor, Server, Wrench, Headphones, BarChart2, Tag, LayoutTemplate, Download, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { downloadPdfFromElement, getQuotePdfFilename } from '../lib/downloadPdf';

const PROJECT_TYPES = [
  { value: 'Web',            Icon: Globe,       color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { value: 'Sistema',        Icon: Monitor,     color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { value: 'Infraestructura',Icon: Server,      color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  { value: 'Mantenimiento',  Icon: Wrench,      color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  { value: 'Soporte',        Icon: Headphones,  color: 'bg-brand/10 text-brand border-brand/30' },
  { value: 'Consultoría',    Icon: BarChart2,   color: 'bg-pink-500/10 text-pink-400 border-pink-500/30' },
  { value: 'Otro',           Icon: Tag,         color: 'bg-white/5 text-gray-400 border-white/10' },
];

const LABEL = 'text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block';
const FIELD = 'bg-black/60 border-white/10 text-white placeholder:text-white/20';
const SEL   = 'flex h-9 w-full rounded-md border border-white/10 bg-black/60 px-3 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand';

const STATUS_COLORS = {
  'Pendiente': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  'Aprobada':  'bg-brand/10 text-brand border-brand/30',
  'Rechazada': 'bg-danger/10 text-danger border-danger/30',
};

const DEFAULT_TERMS = `• Primer depósito del 40% al momento de confirmar el proyecto, necesario para iniciar el desarrollo.\n• Segundo pago del 60% restante al finalizar por completo el desarrollo y antes de la entrega final del sistema.\n• Todos nuestros desarrollos incluyen 1 mes de garantía sin costo adicional, durante el cual realizamos correcciones, ajustes menores y soporte técnico para asegurar el correcto funcionamiento del sistema.`;

async function downloadQuotePdf(quote) {
  const element = document.getElementById('quote-document');
  if (!element) {
    toast.error('No se pudo generar el PDF', { description: 'El documento aún no está listo. Espera un momento e intenta de nuevo.' });
    return false;
  }

  const filename = getQuotePdfFilename(quote.folio);
  toast('Generando PDF...', { description: 'Por favor espera unos segundos.' });

  try {
    await downloadPdfFromElement(element, filename);
    toast.success('PDF descargado', { description: filename });
    return true;
  } catch (err) {
    console.error('PDF generation failed:', err);
    toast.error('No se pudo generar el PDF', { description: err?.message || 'Intenta de nuevo desde la vista previa.' });
    return false;
  }
}

export function Quotes() {
  const [quotes, setQuotes]           = useState([]);
  const [clients, setClients]         = useState([]);
  const [panelOpen, setPanelOpen]     = useState(false);
  
  // Form State
  const [clientId, setClientId]       = useState('');
  const [projectType, setProjectType] = useState('Web');
  const [status, setStatus]           = useState('Pendiente');
  const [items, setItems]             = useState([{ id: Date.now(), qty: 1, desc: '', price: '' }]);
  const [terms, setTerms]             = useState(DEFAULT_TERMS);
  const [folio, setFolio]             = useState('');

  const [confirmDelete, setConfDel]   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [viewQuote, setViewQuote]     = useState(null);
  const [editingId, setEditingId]     = useState(null);

  useEffect(() => {
    const load = async () => {
      setQuotes(await getStorageData('solno_quotes', []));
      setClients(await getStorageData('solno_clients', []));
    };
    load();
  }, []);

  const waitForQuoteDocument = async () => {
    for (let i = 0; i < 30; i++) {
      if (document.getElementById('quote-document')) return true;
      await new Promise(r => requestAnimationFrame(r));
    }
    return false;
  };

  const resetForm = () => {
    setEditingId(null);
    setClientId('');
    setProjectType('Web');
    setStatus('Pendiente');
    setItems([{ id: Date.now(), qty: 1, desc: '', price: '' }]);
    setTerms(DEFAULT_TERMS);
    setFolio('');
  };

  const openNew = () => {
    resetForm();
    setFolio(generateFolio(quotes));
    setPanelOpen(true);
  };

  const openEdit = (quote) => {
    setEditingId(quote.id);
    setClientId(quote.clientId ? String(quote.clientId) : '');
    setProjectType(quote.projectType || 'Web');
    setStatus(quote.status || 'Pendiente');
    setItems(quote.items?.length ? quote.items.map(i => ({ ...i, id: i.id || Date.now() + Math.random() })) : [{ id: Date.now(), qty: 1, desc: '', price: '' }]);
    setTerms(quote.terms || DEFAULT_TERMS);
    setFolio(quote.folio || generateFolio(quotes));
    setPanelOpen(true);
  };

  // Math Helpers
  const calculateSubtotal = (itemsArr) => itemsArr.reduce((acc, item) => acc + (parseFloat(item.qty || 0) * parseFloat(item.price || 0)), 0);
  
  // Auto-generate Folio: SLN-0001
  const generateFolio = (quotesList) => {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const maxId = quotesList.length > 0 ? Math.max(...quotesList.map(q => {
      const parts = q.folio ? q.folio.split('-') : [];
      return parts.length === 2 ? parseInt(parts[1], 10) : 0;
    })) : 0;
    const nextId = (maxId + 1).toString().padStart(4, '0');
    return `SLN-${nextId}`;
  };

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), qty: 1, desc: '', price: '' }]);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (items.some(item => !item.desc || item.price === '')) {
      toast.error('Completa todos los conceptos.');
      return;
    }

    const trimmedFolio = (folio.trim() || generateFolio(quotes)).toUpperCase();
    const duplicate = quotes.some(q =>
      q.folio?.toUpperCase() === trimmedFolio && q.id !== editingId
    );
    if (duplicate) {
      toast.error('Esa referencia ya está en uso.', { description: 'Elige otro número de cotización.' });
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 380));

    const subtotal = calculateSubtotal(items);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    const parsedItems = items.map(i => ({ ...i, qty: parseFloat(i.qty), price: parseFloat(i.price) }));

    let updated;
    let savedQuote;
    if (editingId) {
      savedQuote = {
        ...quotes.find(q => q.id === editingId),
        folio: trimmedFolio,
        clientId: clientId ? parseInt(clientId) : null,
        projectType,
        status,
        items: parsedItems,
        subtotal,
        iva,
        total,
        terms,
      };
      updated = quotes.map(q => q.id === editingId ? savedQuote : q);
      toast.success('Cotización actualizada', { description: `${trimmedFolio} guardada correctamente.` });
    } else {
      savedQuote = {
        id: Date.now(),
        folio: trimmedFolio,
        clientId: clientId ? parseInt(clientId) : null,
        projectType,
        status,
        items: parsedItems,
        subtotal,
        iva,
        total,
        terms,
        date: new Date().toISOString(),
      };
      updated = [...quotes, savedQuote];
      toast.success('Cotización generada', { description: `${trimmedFolio} registrada exitosamente.` });
    }

    setQuotes(updated);
    await setStorageData('solno_quotes', updated);
    window.dispatchEvent(new Event('solno_data_updated'));

    flushSync(() => {
      setLoading(false);
      resetForm();
      setPanelOpen(false);
      setViewQuote(savedQuote);
    });

    const ready = await waitForQuoteDocument();
    if (ready) {
      await downloadQuotePdf(savedQuote);
    } else {
      toast.error('Cotización guardada', { description: 'Usa el botón Descargar PDF en la vista previa.' });
    }
  };

  const handleDelete = async (id) => {
    const updated = quotes.filter(q => q.id !== id);
    setQuotes(updated);
    await setStorageData('solno_quotes', updated);
    window.dispatchEvent(new Event('solno_data_updated'));
    setConfDel(null);
    toast.error('Cotización eliminada');
  };

  const totalSum = quotes.reduce((acc, q) => acc + (q.total || q.amount || 0), 0); // fallback for old data

  // --- PRINT PREVIEW MODAL ---
  if (viewQuote) {
    const linkedClient = clients.find(c => c.id === viewQuote.clientId);
    return (
      <div 
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex justify-center overflow-y-auto print:bg-white print:static print:block"
        onClick={() => setViewQuote(null)}
      >
        <div 
          className="min-h-screen py-10 print:py-0 px-4 w-full overflow-x-auto pb-32"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Action Bar (Hidden on print) */}
          <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-3 no-print z-[200] px-4 pointer-events-none">
            <div className="flex gap-2 sm:gap-3 pointer-events-auto bg-black/80 backdrop-blur-xl p-2 sm:p-3 rounded-2xl border border-white/10 shadow-2xl">
              <Button onClick={() => downloadQuotePdf(viewQuote)} className="bg-brand text-black font-bold hover:shadow-glow shadow-lg px-4 sm:px-6">
                <Download className="w-4 h-4 mr-2" /> Descargar PDF
              </Button>
              <Button onClick={() => window.print()} className="bg-white/10 text-white font-bold hover:bg-white/20 shadow-lg border border-white/10 hidden sm:flex px-6">
                <Printer className="w-4 h-4 mr-2" /> Imprimir
              </Button>
              <Button onClick={() => setViewQuote(null)} variant="outline" className="bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/10 shadow-none px-3">
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Paper Document — carta US: 800×1035px */}
          <div id="quote-document" className="text-black w-[800px] min-w-[800px] shadow-2xl print:shadow-none relative font-sans mx-auto overflow-hidden" style={{ height: '1035px' }}>
            <img
              src="/hoja.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none print:object-fill"
              aria-hidden="true"
            />
            <div className="relative z-10 px-10 pt-[228px] pb-[132px] h-full flex flex-col">

              {/* Folio y fecha */}
              <div className="absolute top-[148px] right-10 text-right">
                <p className="text-base font-black text-gray-900 tracking-wide">{viewQuote.folio}</p>
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.18em] mt-1 mb-0.5">Fecha de expedición</p>
                <p className="text-xs font-semibold text-gray-700">
                  {new Date(viewQuote.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Cliente y proyecto */}
              <div className="mb-4 grid grid-cols-2 gap-10">
                <div>
                  <h3 className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.18em] mb-1.5 pb-1 border-b-2 border-[#8ca800]/40">
                    Cotizado a
                  </h3>
                  {linkedClient ? (
                    <div className="space-y-0">
                      <p className="font-bold text-sm text-gray-900">{linkedClient.firstName} {linkedClient.lastName}</p>
                      <p className="text-xs text-gray-600 font-medium">{linkedClient.company || 'Particular'}</p>
                      {linkedClient.email && <p className="text-[10px] text-gray-500 mt-1">{linkedClient.email}</p>}
                      {linkedClient.phone && <p className="text-[10px] text-gray-500">{linkedClient.phone}</p>}
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-gray-500">Cliente General</p>
                  )}
                </div>
                <div>
                  <h3 className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.18em] mb-1.5 pb-1 border-b-2 border-[#8ca800]/40">
                    Proyecto / Servicio
                  </h3>
                  <p className="font-bold text-sm text-[#6d8f00]">{viewQuote.projectType}</p>
                </div>
              </div>

              {/* Tabla de conceptos */}
              <div className="bg-white border border-gray-200 rounded-md overflow-hidden mb-3 shadow-sm">
                <table className="w-full text-xs table-fixed border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="py-1.5 px-2 font-bold text-[10px] uppercase tracking-wider text-center" style={{ width: '12%' }}>Cantidad</th>
                      <th className="py-1.5 px-2 font-bold text-[10px] uppercase tracking-wider text-center" style={{ width: '48%' }}>Descripción</th>
                      <th className="py-1.5 px-2 font-bold text-[10px] uppercase tracking-wider text-center" style={{ width: '20%' }}>P. Unitario</th>
                      <th className="py-1.5 px-2 font-bold text-[10px] uppercase tracking-wider text-center" style={{ width: '20%' }}>Importe</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {(viewQuote.items || []).map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-200 last:border-b-0">
                        <td className="py-1.5 px-2 font-medium text-gray-800 text-center align-middle">{item.qty}</td>
                        <td className="py-1.5 px-2 font-medium text-gray-900 text-center align-middle">{item.desc}</td>
                        <td className="py-1.5 px-2 text-gray-700 text-center align-middle tabular-nums">
                          ${parseFloat(item.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-1.5 px-2 font-semibold text-gray-900 text-center align-middle tabular-nums">
                          ${(item.qty * item.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                    {(!viewQuote.items || viewQuote.items.length === 0) && (
                      <tr className="border-b border-gray-200">
                        <td className="py-1.5 px-2 font-medium text-gray-800 text-center align-middle">1</td>
                        <td className="py-1.5 px-2 font-medium text-gray-900 text-center align-middle">{viewQuote.description || 'Concepto General'}</td>
                        <td className="py-1.5 px-2 text-gray-700 text-center align-middle tabular-nums">
                          ${(viewQuote.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-1.5 px-2 font-semibold text-gray-900 text-center align-middle tabular-nums">
                          ${(viewQuote.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div className="flex justify-end mb-3">
                <div className="w-60 overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm">
                  <div className="px-4 py-2.5 space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span className="uppercase text-[9px] font-semibold tracking-wider text-gray-500">Subtotal</span>
                      <span className="font-medium tabular-nums text-gray-800">
                        ${(viewQuote.subtotal || viewQuote.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span className="uppercase text-[9px] font-semibold tracking-wider text-gray-500">IVA (16%)</span>
                      <span className="font-medium tabular-nums text-gray-800">
                        ${(viewQuote.iva || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-black text-white px-4 py-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em]">Total</span>
                    <span className="text-lg font-black tabular-nums tracking-tight">
                      ${(viewQuote.total || viewQuote.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Condiciones */}
              <div className="bg-white/90 border border-gray-200 rounded-md px-4 py-2.5 shadow-sm border-l-4 border-l-[#8ca800] mt-auto">
                <h4 className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-800 mb-1">
                  Condiciones y formas de pago
                </h4>
                <div className="text-[10px] text-gray-600 whitespace-pre-line leading-snug">
                  {viewQuote.terms || DEFAULT_TERMS}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- CRUD LIST VIEW ---
  return (
    <div className="space-y-6 relative">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-brand" /> Cotizaciones
          </h1>
          <p className="text-gray-400 mt-2">Crea cotizaciones profesionales, calcula el IVA y expórtalas en PDF.</p>
        </div>
        <Button onClick={openNew}
          className="bg-brand text-black hover:bg-brand/90 hover:shadow-glow font-bold shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Nueva Cotización
        </Button>
      </div>

      <Card className="glass border-white/5">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white font-bold">Historial de Cotizaciones</CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-brand" />
                <span className="text-sm font-bold text-brand">${totalSum.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <span className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-400">{quotes.length} registros</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {quotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FileText className="w-14 h-14 text-white/8 mb-4" />
              <p className="text-white font-medium">Sin cotizaciones registradas</p>
              <p className="text-sm text-gray-500 mt-1 mb-4">Genera tu primera cotización profesional para un cliente.</p>
              <Button onClick={openNew} className="bg-brand text-black font-bold hover:shadow-glow">
                <Plus className="w-4 h-4 mr-2" /> Crear Cotización
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              <AnimatePresence>
                {[...quotes].reverse().map(quote => {
                  const linkedClient = clients.find(c => c.id === quote.clientId);
                  const typeObj = PROJECT_TYPES.find(t => t.value === quote.projectType);
                  return (
                    <motion.div key={quote.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 20 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-white/2 group gap-4">
                      
                      <div className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer" onClick={() => setViewQuote(quote)}>
                        <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-brand" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-brand">{quote.folio || 'ANTIGUA'}</span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${STATUS_COLORS[quote.status] || STATUS_COLORS['Pendiente']}`}>
                              {quote.status}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-white truncate">
                            {linkedClient ? `${linkedClient.firstName} ${linkedClient.lastName}` : 'Cliente General'}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <span className="text-xs text-gray-500">{new Date(quote.date).toLocaleDateString('es-MX')}</span>
                            {typeObj && (
                              <div className="flex items-center gap-1">
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border ${typeObj.color}`}>
                                  {typeObj.value}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 sm:ml-4">
                        <span className="text-base font-bold text-white">${(quote.total || quote.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" onClick={() => setViewQuote(quote)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-2 h-auto opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" title="Ver / Imprimir">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" onClick={() => openEdit(quote)} className="text-brand/70 hover:text-brand hover:bg-brand/10 p-2 h-auto opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </Button>

                          {confirmDelete === quote.id ? (
                            <div className="flex items-center gap-1">
                              <Button size="sm" onClick={() => handleDelete(quote.id)} className="bg-danger text-white h-8 px-2 text-xs">Sí</Button>
                              <Button size="sm" variant="ghost" onClick={() => setConfDel(null)} className="text-gray-400 h-8 px-2 text-xs">No</Button>
                            </div>
                          ) : (
                            <Button variant="ghost" onClick={() => setConfDel(quote.id)}
                              className="text-white/15 hover:text-danger hover:bg-danger/10 p-2 h-auto opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* --- CREATION PANEL --- */}
      <SlidePanel open={panelOpen} onClose={() => { setPanelOpen(false); resetForm(); }}
        title={editingId ? 'Editar Cotización' : 'Crear Cotización Detallada'}
        subtitle={editingId ? 'Modifica los datos y guarda los cambios' : 'Generador de Folio y PDF Automático'}
        icon={FileText} accentColor="text-brand">
        <form onSubmit={handleAdd} className="space-y-6 pb-6">

          <div>
            <label className={LABEL}>Número de referencia</label>
            <Input
              value={folio}
              onChange={e => setFolio(e.target.value.toUpperCase())}
              placeholder="SLN-0001"
              className={`${FIELD} font-mono tracking-wide`}
              required
            />
            <p className="text-[10px] text-gray-500 mt-1.5">
              Se sugiere el siguiente folio automáticamente; puedes editarlo antes de guardar.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Vincular a Cliente</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} className={SEL}>
                <option value="">— Cliente General —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Tipo de Proyecto</label>
              <select value={projectType} onChange={e => setProjectType(e.target.value)} className={SEL}>
                {PROJECT_TYPES.map(t => <option key={t.value} value={t.value}>{t.value}</option>)}
              </select>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-white">Conceptos a Cotizar</label>
              <Button type="button" size="sm" variant="outline" onClick={handleAddItem} className="h-7 text-xs border-brand/30 text-brand hover:bg-brand/10">
                <Plus className="w-3 h-3 mr-1" /> Añadir
              </Button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="flex flex-wrap sm:flex-nowrap gap-2 items-start relative group">
                  <div className="w-16 shrink-0">
                    <Input type="number" min="1" step="0.5" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', e.target.value)} placeholder="Cant" className={`${FIELD} h-8 text-sm`} required />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <Input value={item.desc} onChange={e => handleItemChange(item.id, 'desc', e.target.value)} placeholder="Descripción del servicio" className={`${FIELD} h-8 text-sm`} required />
                  </div>
                  <div className="w-28 shrink-0">
                    <Input type="number" min="0" step="0.01" value={item.price} onChange={e => handleItemChange(item.id, 'price', e.target.value)} placeholder="P. Unitario" className={`${FIELD} h-8 text-sm`} required />
                  </div>
                  <button type="button" onClick={() => handleRemoveItem(item.id)} disabled={items.length === 1} className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-danger disabled:opacity-30 shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Live Totals */}
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
              <div className="text-right space-y-1">
                <p className="text-xs text-gray-400">Subtotal: <span className="text-white ml-2">${calculateSubtotal(items).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></p>
                <p className="text-xs text-gray-400">IVA (16%): <span className="text-white ml-2">${(calculateSubtotal(items) * 0.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></p>
                <p className="text-sm font-bold text-brand mt-1 pt-1 border-t border-white/10">Total: <span className="ml-2">${(calculateSubtotal(items) * 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></p>
              </div>
            </div>
          </div>

          <div>
            <label className={LABEL}>Estado Inicial</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className={SEL}>
              <option>Pendiente</option><option>Aprobada</option><option>Rechazada</option>
            </select>
          </div>

          <div>
            <label className={LABEL}>Condiciones y Formas de Pago</label>
            <textarea value={terms} onChange={e => setTerms(e.target.value)}
              className="flex w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-brand resize-none min-h-[100px]" required />
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-[#0a0a0a] pb-4">
            <Button type="button" variant="ghost" onClick={() => setPanelOpen(false)} className="flex-1 border border-white/10 text-gray-400 hover:text-white">Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-[2] bg-brand text-black hover:bg-brand/90 font-bold hover:shadow-glow">
              {loading
                ? <span className="animate-pulse">{editingId ? 'Guardando...' : 'Generando PDF...'}</span>
                : <><Download className="w-4 h-4 mr-1.5" />Guardar y Descargar PDF</>
              }
            </Button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}
