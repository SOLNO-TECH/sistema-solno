import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SlidePanel } from '../components/ui/SlidePanel';
import { getStorageData, setStorageData } from '../lib/utils';
import { Plus, Trash2, FileText, Link as LinkIcon, DollarSign, Printer, X, Eye, Globe, Monitor, Server, Wrench, Headphones, BarChart2, Tag, LayoutTemplate, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';

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

  const [confirmDelete, setConfDel]   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [viewQuote, setViewQuote]     = useState(null); // Quote object to preview/print

  useEffect(() => {
    const load = async () => {
      setQuotes(await getStorageData('solno_quotes', []));
      setClients(await getStorageData('solno_clients', []));
    };
    load();
  }, []);

  const resetForm = () => { 
    setClientId(''); 
    setProjectType('Web'); 
    setStatus('Pendiente'); 
    setItems([{ id: Date.now(), qty: 1, desc: '', price: '' }]);
    setTerms(DEFAULT_TERMS);
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
    setLoading(true);
    await new Promise(r => setTimeout(r, 380));
    
    const subtotal = calculateSubtotal(items);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    const newQuote = {
      id: Date.now(),
      folio: generateFolio(quotes),
      clientId: clientId ? parseInt(clientId) : null,
      projectType,
      status,
      items: items.map(i => ({ ...i, qty: parseFloat(i.qty), price: parseFloat(i.price) })),
      subtotal,
      iva,
      total,
      terms,
      date: new Date().toISOString(),
    };

    const updated = [...quotes, newQuote];
    setQuotes(updated);
    await setStorageData('solno_quotes', updated);
    window.dispatchEvent(new Event('solno_data_updated'));
    
    setLoading(false);
    resetForm();
    setPanelOpen(false);
    toast.success('Cotización generada', { description: `${newQuote.folio} registrada exitosamente.` });
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
              <Button onClick={() => {
                const element = document.getElementById('quote-document');
                if (element) {
                  toast('Generando PDF...', { description: 'Por favor espera unos segundos.' });
                  html2pdf().set({
                    margin: 0.2, // Small margin to prevent edge cutoffs and scale down slightly
                    filename: `${viewQuote.folio}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, logging: true },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                  }).from(element).save().then(() => toast.success('Descargado correctamente'));
                }
              }} className="bg-brand text-black font-bold hover:shadow-glow shadow-lg px-4 sm:px-6">
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

          {/* Paper Document */}
          <div id="quote-document" className="bg-white text-black min-w-[800px] w-[800px] shadow-2xl print:shadow-none p-8 md:p-10 relative font-sans mx-auto" style={{ minHeight: '1035px' }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-6 border-b-2 border-black/10 pb-6">
              <div>
                <div className="mb-2">
                  <img src="/logo.png?v=new3" alt="Solno Logo" className="h-[200px] w-auto object-contain" crossOrigin="anonymous" style={{ height: '200px', objectFit: 'contain' }} />
                </div>
                <div className="text-sm text-gray-600 leading-relaxed max-w-xs">
                  <p>Calle 20 de Noviembre #7 Int. B,</p>
                  <p>Manzana 48, Lote 7B, C.P. 63737,</p>
                  <p>Mezcales, Bahía de Banderas, Nayarit, México.</p>
                  <p className="mt-2 font-medium">Tel: 329 296 5460 - 322 215 3935</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-4xl font-black text-black tracking-tighter uppercase">Cotización</h2>
                <p className="text-lg font-medium text-gray-500 mt-1">{viewQuote.folio}</p>
                <div className="mt-6 border border-gray-300 rounded-lg p-3 text-left block w-max ml-auto bg-white">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Fecha de Expedición</p>
                  <p className="font-bold text-black">{new Date(viewQuote.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="mb-6 grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1 border-b border-gray-200 pb-1">Cotizado A</h3>
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
                <h3 className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1 border-b border-gray-200 pb-1">Proyecto / Servicio</h3>
                <p className="font-bold text-lg text-[#8ca800]">{viewQuote.projectType}</p>
              </div>
            </div>

            {/* Table */}
            <table className="w-full mb-6 text-sm table-fixed">
              <thead>
                <tr className="bg-black text-white">
                  <th className="py-2 px-3 font-bold rounded-tl-lg" style={{ width: '15%' }}><div style={{ display: 'block', textAlign: 'center', width: '100%' }}>Cant.</div></th>
                  <th className="py-2 px-3 font-bold" style={{ width: '45%' }}><div style={{ display: 'block', textAlign: 'center', width: '100%' }}>Descripción</div></th>
                  <th className="py-2 px-3 font-bold" style={{ width: '20%' }}><div style={{ display: 'block', textAlign: 'center', width: '100%' }}>P. Unitario</div></th>
                  <th className="py-2 px-3 font-bold rounded-tr-lg" style={{ width: '20%' }}><div style={{ display: 'block', textAlign: 'center', width: '100%' }}>Importe</div></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(viewQuote.items || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-700"><div style={{ display: 'block', textAlign: 'center', width: '100%' }}>{item.qty}</div></td>
                    <td className="py-2 px-3 font-medium"><div style={{ display: 'block', textAlign: 'center', width: '100%' }}>{item.desc}</div></td>
                    <td className="py-2 px-3 text-gray-600"><div style={{ display: 'block', textAlign: 'center', width: '100%' }}>${parseFloat(item.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div></td>
                    <td className="py-2 px-3 font-bold text-gray-900"><div style={{ display: 'block', textAlign: 'center', width: '100%' }}>${(item.qty * item.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div></td>
                  </tr>
                ))}
                {/* Fallback for old quotes that only had a single amount/description */}
                {(!viewQuote.items || viewQuote.items.length === 0) && (
                   <tr className="hover:bg-gray-50">
                     <td className="py-2 px-3 font-medium text-gray-700"><div style={{ display: 'block', textAlign: 'center', width: '100%' }}>1</div></td>
                     <td className="py-2 px-3 font-medium"><div style={{ display: 'block', textAlign: 'center', width: '100%' }}>{viewQuote.description || 'Concepto General'}</div></td>
                     <td className="py-2 px-3 text-gray-600"><div style={{ display: 'block', textAlign: 'center', width: '100%' }}>${(viewQuote.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div></td>
                     <td className="py-2 px-3 font-bold text-gray-900"><div style={{ display: 'block', textAlign: 'center', width: '100%' }}>${(viewQuote.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div></td>
                   </tr>
                )}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">${(viewQuote.subtotal || viewQuote.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IVA (16%)</span>
                  <span className="font-medium">${(viewQuote.iva || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xl font-black pt-3 border-t-2 border-black">
                  <span>Total</span>
                  <span className="text-[#8ca800]">${(viewQuote.total || viewQuote.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mt-auto">
              <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-3">Condiciones y Formas de Pago</h4>
              <div className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">
                {viewQuote.terms || DEFAULT_TERMS}
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
        <Button onClick={() => { resetForm(); setPanelOpen(true); }}
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
              <Button onClick={() => setPanelOpen(true)} className="bg-brand text-black font-bold hover:shadow-glow">
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
      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)}
        title="Crear Cotización Detallada" subtitle="Generador de Folio y PDF Automático"
        icon={FileText} accentColor="text-brand">
        <form onSubmit={handleAdd} className="space-y-6 pb-6">
          
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
              {loading ? <span className="animate-pulse">Generando...</span> : <><FileText className="w-4 h-4 mr-1.5" />Guardar Cotización</>}
            </Button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}
