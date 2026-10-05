import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SlidePanel } from '../components/ui/SlidePanel';
import { ContractPreviewView } from '../components/ContractPreviewView';
import { getStorageData, setStorageData } from '../lib/utils';
import {
  Plus, Trash2, FileSignature, Eye, Download, Pencil, Globe, Monitor, Server,
  Wrench, Headphones, BarChart2, Tag, Users, Briefcase,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { downloadPdfFromElement, getContractPdfFilename } from '../lib/downloadPdf';

const PROJECT_TYPES = [
  { value: 'Web',             Icon: Globe,       color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { value: 'Sistema',         Icon: Monitor,     color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { value: 'Infraestructura', Icon: Server,      color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  { value: 'Mantenimiento',   Icon: Wrench,      color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  { value: 'Soporte',         Icon: Headphones,  color: 'bg-brand/10 text-brand border-brand/30' },
  { value: 'Consultoría',     Icon: BarChart2,   color: 'bg-pink-500/10 text-pink-400 border-pink-500/30' },
  { value: 'Otro',            Icon: Tag,         color: 'bg-white/5 text-gray-400 border-white/10' },
];

const LABEL = 'text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block';
const FIELD = 'bg-black/60 border-white/10 text-white placeholder:text-white/20';
const SEL   = 'flex h-9 w-full rounded-md border border-white/10 bg-black/60 px-3 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand';

const STATUS_COLORS = {
  Borrador:  'bg-gray-500/10 text-gray-400 border-gray-500/30',
  Activo:    'bg-brand/10 text-brand border-brand/30',
  Vencido:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  Cancelado: 'bg-danger/10 text-danger border-danger/30',
};

const CATEGORY_LABELS = {
  servicio:     { label: 'Servicio',     color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', Icon: Briefcase },
  colaborador:  { label: 'Colaborador',  color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', Icon: Users },
};

const SERVICE_DEFAULT_CLAUSES = `• El cliente se compromete a proporcionar la información y recursos necesarios para la ejecución del servicio.\n• Los pagos se realizarán conforme al calendario acordado; el retraso en pagos puede suspender la prestación del servicio.\n• La propiedad intelectual del desarrollo entregado se transferirá al cliente una vez liquidado el monto total acordado.\n• Cualquier modificación al alcance deberá formalizarse por escrito y puede implicar ajustes en costos y plazos.\n• Ambas partes se obligan a mantener confidencialidad sobre la información intercambiada durante la vigencia del contrato.`;

const COLLABORATOR_DEFAULT_CLAUSES = `• El colaborador prestará sus servicios de forma independiente, sin relación laboral de subordinación.\n• La compensación se pagará conforme a la periodicidad acordada, previa entrega de factura o recibo correspondiente.\n• El colaborador se compromete a cumplir con los plazos y entregables establecidos.\n• Toda información del proyecto y del cliente será tratada como confidencial.\n• El colaborador cede los derechos de propiedad intelectual de los entregables a Grupo Solno, salvo acuerdo distinto por escrito.`;

async function downloadContractPdf(contract) {
  const element = document.getElementById('contract-document');
  if (!element) {
    toast.error('No se pudo generar el PDF', { description: 'El documento aún no está listo.' });
    return false;
  }
  const filename = getContractPdfFilename(contract.folio);
  toast('Generando PDF...', { description: 'Por favor espera unos segundos.' });
  try {
    await downloadPdfFromElement(element, filename);
    toast.success('PDF descargado', { description: filename });
    return true;
  } catch (err) {
    console.error('PDF generation failed:', err);
    toast.error('No se pudo generar el PDF', { description: err?.message || 'Intenta de nuevo.' });
    return false;
  }
}

function generateFolio(contracts) {
  const maxId = contracts.length > 0 ? Math.max(...contracts.map(c => {
    const parts = c.folio ? c.folio.split('-') : [];
    return parts.length === 2 ? parseInt(parts[1], 10) : 0;
  })) : 0;
  return `CONT-${String(maxId + 1).padStart(4, '0')}`;
}

function getContractTitle(contract, clients) {
  if (contract.category === 'colaborador') return contract.collaboratorName || 'Colaborador';
  const client = clients.find(c => c.id === contract.clientId);
  return client ? `${client.firstName} ${client.lastName}` : 'Cliente General';
}

export function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [viewContract, setViewContract] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfDel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('todos');

  // Form
  const [folio, setFolio] = useState('');
  const [category, setCategory] = useState('servicio');
  const [status, setStatus] = useState('Borrador');
  const [clientId, setClientId] = useState('');
  const [projectType, setProjectType] = useState('Web');
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [collaboratorName, setCollaboratorName] = useState('');
  const [collaboratorRole, setCollaboratorRole] = useState('');
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [compensation, setCompensation] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState('Mensual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [clauses, setClauses] = useState(SERVICE_DEFAULT_CLAUSES);

  useEffect(() => {
    (async () => {
      setContracts(await getStorageData('solno_contracts', []));
      setClients(await getStorageData('solno_clients', []));
    })();
  }, []);

  const waitForDocument = async () => {
    for (let i = 0; i < 30; i++) {
      if (document.getElementById('contract-document')) return true;
      await new Promise(r => requestAnimationFrame(r));
    }
    return false;
  };

  const handleDownloadFromPreview = async () => {
    if (!viewContract) return;
    const ready = await waitForDocument();
    if (!ready) { toast.error('No se pudo generar el PDF'); return; }
    await downloadContractPdf(viewContract);
  };

  const handleDownloadContract = async (contract, e) => {
    e?.stopPropagation();
    setViewContract(contract);
    await new Promise(r => setTimeout(r, 100));
    const ready = await waitForDocument();
    if (!ready) { toast.error('No se pudo generar el PDF'); setViewContract(null); return; }
    const ok = await downloadContractPdf(contract);
    if (ok) setViewContract(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setCategory('servicio');
    setStatus('Borrador');
    setClientId('');
    setProjectType('Web');
    setServiceTitle('');
    setServiceDescription('');
    setAmount('');
    setDuration('');
    setDeliverables('');
    setCollaboratorName('');
    setCollaboratorRole('');
    setCollaboratorEmail('');
    setCompensation('');
    setPaymentFrequency('Mensual');
    setStartDate('');
    setEndDate('');
    setResponsibilities('');
    setClauses(SERVICE_DEFAULT_CLAUSES);
    setFolio('');
  };

  const openNew = (cat = 'servicio') => {
    resetForm();
    setCategory(cat);
    setClauses(cat === 'servicio' ? SERVICE_DEFAULT_CLAUSES : COLLABORATOR_DEFAULT_CLAUSES);
    setFolio(generateFolio(contracts));
    setPanelOpen(true);
  };

  const openEdit = (contract) => {
    setEditingId(contract.id);
    setFolio(contract.folio || generateFolio(contracts));
    setCategory(contract.category || 'servicio');
    setStatus(contract.status || 'Borrador');
    setClientId(contract.clientId ? String(contract.clientId) : '');
    setProjectType(contract.projectType || 'Web');
    setServiceTitle(contract.serviceTitle || '');
    setServiceDescription(contract.serviceDescription || '');
    setAmount(contract.amount ?? '');
    setDuration(contract.duration || '');
    setDeliverables(contract.deliverables || '');
    setCollaboratorName(contract.collaboratorName || '');
    setCollaboratorRole(contract.collaboratorRole || '');
    setCollaboratorEmail(contract.collaboratorEmail || '');
    setCompensation(contract.compensation ?? '');
    setPaymentFrequency(contract.paymentFrequency || 'Mensual');
    setStartDate(contract.startDate ? contract.startDate.slice(0, 10) : '');
    setEndDate(contract.endDate ? contract.endDate.slice(0, 10) : '');
    setResponsibilities(contract.responsibilities || '');
    setClauses(contract.clauses || (contract.category === 'colaborador' ? COLLABORATOR_DEFAULT_CLAUSES : SERVICE_DEFAULT_CLAUSES));
    setPanelOpen(true);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setClauses(cat === 'servicio' ? SERVICE_DEFAULT_CLAUSES : COLLABORATOR_DEFAULT_CLAUSES);
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    if (category === 'servicio') {
      if (!serviceTitle.trim() || !serviceDescription.trim()) {
        toast.error('Completa el título y la descripción del servicio.');
        return;
      }
    } else {
      if (!collaboratorName.trim() || !collaboratorRole.trim()) {
        toast.error('Completa el nombre y rol del colaborador.');
        return;
      }
    }

    const trimmedFolio = (folio.trim() || generateFolio(contracts)).toUpperCase();
    if (contracts.some(c => c.folio?.toUpperCase() === trimmedFolio && c.id !== editingId)) {
      toast.error('Esa referencia ya está en uso.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 380));

    const payload = {
      folio: trimmedFolio,
      category,
      status,
      clauses,
      ...(category === 'servicio' ? {
        clientId: clientId ? parseInt(clientId) : null,
        projectType,
        serviceTitle: serviceTitle.trim(),
        serviceDescription: serviceDescription.trim(),
        amount: parseFloat(amount) || 0,
        duration: duration.trim(),
        deliverables: deliverables.trim(),
      } : {
        collaboratorName: collaboratorName.trim(),
        collaboratorRole: collaboratorRole.trim(),
        collaboratorEmail: collaboratorEmail.trim(),
        compensation: parseFloat(compensation) || 0,
        paymentFrequency,
        startDate: startDate || null,
        endDate: endDate || null,
        responsibilities: responsibilities.trim(),
      }),
    };

    let updated;
    if (editingId) {
      const existing = contracts.find(c => c.id === editingId);
      const saved = { ...existing, ...payload };
      updated = contracts.map(c => c.id === editingId ? saved : c);
      toast.success('Contrato actualizado', { description: trimmedFolio });
    } else {
      const saved = { id: Date.now(), ...payload, date: new Date().toISOString() };
      updated = [...contracts, saved];
      toast.success('Contrato creado', { description: trimmedFolio });
    }

    setContracts(updated);
    await setStorageData('solno_contracts', updated);
    window.dispatchEvent(new Event('solno_data_updated'));
    setLoading(false);
    resetForm();
    setPanelOpen(false);
  };

  const handleDelete = async (id) => {
    const updated = contracts.filter(c => c.id !== id);
    setContracts(updated);
    await setStorageData('solno_contracts', updated);
    window.dispatchEvent(new Event('solno_data_updated'));
    setConfDel(null);
    toast.error('Contrato eliminado');
  };

  const filtered = filterCategory === 'todos'
    ? contracts
    : contracts.filter(c => c.category === filterCategory);

  const previewClient = viewContract?.category === 'servicio'
    ? clients.find(c => c.id === viewContract.clientId)
    : null;

  return (
    <div className="space-y-6 relative">
      {viewContract ? (
        <ContractPreviewView
          contract={viewContract}
          client={previewClient}
          onDownload={handleDownloadFromPreview}
          onClose={() => setViewContract(null)}
        />
      ) : (
      <>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2 sm:gap-3">
              <FileSignature className="w-7 h-7 sm:w-8 sm:h-8 text-brand shrink-0" /> Contratos
            </h1>
            <p className="text-gray-400 mt-1.5 sm:mt-2 text-sm sm:text-base">
              Contratos de servicio (Web, Sistema, etc.) y de colaboradores con plantilla oficial.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
            <Button onClick={() => openNew('servicio')} className="bg-brand text-black hover:bg-brand/90 hover:shadow-glow font-bold w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Contrato de Servicio
            </Button>
            <Button onClick={() => openNew('colaborador')} variant="outline" className="border-white/15 text-white hover:bg-white/5 font-bold w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Contrato Colaborador
            </Button>
          </div>
        </div>

        <Card className="glass border-white/5">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-white font-bold">Historial de Contratos</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                {['todos', 'servicio', 'colaborador'].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilterCategory(f)}
                    className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors ${
                      filterCategory === f
                        ? 'bg-brand/10 text-brand border-brand/30'
                        : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {f === 'todos' ? 'Todos' : CATEGORY_LABELS[f].label}
                  </button>
                ))}
                <span className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-400">{filtered.length} registros</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileSignature className="w-14 h-14 text-white/8 mb-4" />
                <p className="text-white font-medium">Sin contratos registrados</p>
                <p className="text-sm text-gray-500 mt-1 mb-4">Crea tu primer contrato de servicio o de colaborador.</p>
                <div className="flex gap-2">
                  <Button onClick={() => openNew('servicio')} className="bg-brand text-black font-bold hover:shadow-glow">
                    <Plus className="w-4 h-4 mr-2" /> Servicio
                  </Button>
                  <Button onClick={() => openNew('colaborador')} variant="outline" className="border-white/15 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Colaborador
                  </Button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                <AnimatePresence>
                  {[...filtered].reverse().map(contract => {
                    const cat = CATEGORY_LABELS[contract.category] || CATEGORY_LABELS.servicio;
                    const CatIcon = cat.Icon;
                    const typeObj = contract.category === 'servicio'
                      ? PROJECT_TYPES.find(t => t.value === contract.projectType)
                      : null;
                    return (
                      <motion.div
                        key={contract.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 hover:bg-white/2 group gap-4"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer" onClick={() => setViewContract(contract)}>
                          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                            <CatIcon className="w-4 h-4 text-brand" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold text-brand">{contract.folio}</span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${cat.color}`}>{cat.label}</span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${STATUS_COLORS[contract.status] || STATUS_COLORS.Borrador}`}>
                                {contract.status}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-white truncate">
                              {contract.category === 'servicio'
                                ? contract.serviceTitle || getContractTitle(contract, clients)
                                : contract.collaboratorName}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                              <span className="text-xs text-gray-500">{new Date(contract.date).toLocaleDateString('es-MX')}</span>
                              {typeObj && (
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border ${typeObj.color}`}>
                                  {typeObj.value}
                                </span>
                              )}
                              {contract.category === 'colaborador' && contract.collaboratorRole && (
                                <span className="text-[9px] text-gray-500">{contract.collaboratorRole}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 sm:ml-4">
                          <span className="text-base font-bold text-white">
                            ${(contract.category === 'servicio' ? contract.amount : contract.compensation || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                          <div className="flex items-center gap-1 flex-wrap justify-end">
                            <Button variant="ghost" onClick={(e) => handleDownloadContract(contract, e)} className="text-brand hover:text-brand hover:bg-brand/10 p-2 h-auto opacity-100 shrink-0" title="Descargar PDF">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" onClick={() => setViewContract(contract)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-2 h-auto opacity-100" title="Ver contrato">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" onClick={() => openEdit(contract)} className="text-brand/70 hover:text-brand hover:bg-brand/10 p-2 h-auto opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" title="Editar">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {confirmDelete === contract.id ? (
                              <div className="flex items-center gap-1">
                                <Button size="sm" onClick={() => handleDelete(contract.id)} className="bg-danger text-white h-8 px-2 text-xs">Sí</Button>
                                <Button size="sm" variant="ghost" onClick={() => setConfDel(null)} className="text-gray-400 h-8 px-2 text-xs">No</Button>
                              </div>
                            ) : (
                              <Button variant="ghost" onClick={() => setConfDel(contract.id)} className="text-white/15 hover:text-danger hover:bg-danger/10 p-2 h-auto opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
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
      </>
      )}

      <SlidePanel
        open={panelOpen}
        onClose={() => { setPanelOpen(false); resetForm(); }}
        title={editingId ? 'Editar Contrato' : category === 'servicio' ? 'Nuevo Contrato de Servicio' : 'Nuevo Contrato de Colaboración'}
        subtitle={editingId ? 'Modifica los datos y guarda los cambios' : 'Generador de folio y PDF automático'}
        icon={FileSignature}
        accentColor="text-brand"
      >
        <form onSubmit={handleAdd} className="space-y-6 pb-6">
          <div>
            <label className={LABEL}>Número de referencia</label>
            <Input value={folio} onChange={e => setFolio(e.target.value.toUpperCase())} placeholder="CONT-0001" className={`${FIELD} font-mono tracking-wide`} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Tipo de contrato</label>
              <select value={category} onChange={e => handleCategoryChange(e.target.value)} className={SEL} disabled={!!editingId}>
                <option value="servicio">Servicio</option>
                <option value="colaborador">Colaborador</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Estado</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className={SEL}>
                <option>Borrador</option>
                <option>Activo</option>
                <option>Vencido</option>
                <option>Cancelado</option>
              </select>
            </div>
          </div>

          {category === 'servicio' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Vincular a Cliente</label>
                  <select value={clientId} onChange={e => setClientId(e.target.value)} className={SEL}>
                    <option value="">— Cliente General —</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Tipo de Servicio</label>
                  <select value={projectType} onChange={e => setProjectType(e.target.value)} className={SEL}>
                    {PROJECT_TYPES.map(t => <option key={t.value} value={t.value}>{t.value}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={LABEL}>Título del servicio</label>
                <Input value={serviceTitle} onChange={e => setServiceTitle(e.target.value)} placeholder="Ej. Desarrollo de sistema ERP" className={FIELD} required />
              </div>
              <div>
                <label className={LABEL}>Descripción / Objeto del contrato</label>
                <textarea value={serviceDescription} onChange={e => setServiceDescription(e.target.value)} className="flex w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-brand resize-none min-h-[80px]" required />
              </div>
              <div>
                <label className={LABEL}>Entregables</label>
                <textarea value={deliverables} onChange={e => setDeliverables(e.target.value)} placeholder="Lista de entregables acordados..." className="flex w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-brand resize-none min-h-[60px]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Monto acordado (MXN)</label>
                  <Input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className={FIELD} />
                </div>
                <div>
                  <label className={LABEL}>Vigencia / Duración</label>
                  <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="Ej. 3 meses" className={FIELD} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Nombre del colaborador</label>
                  <Input value={collaboratorName} onChange={e => setCollaboratorName(e.target.value)} className={FIELD} required />
                </div>
                <div>
                  <label className={LABEL}>Rol / Puesto</label>
                  <Input value={collaboratorRole} onChange={e => setCollaboratorRole(e.target.value)} placeholder="Ej. Desarrollador Full Stack" className={FIELD} required />
                </div>
              </div>
              <div>
                <label className={LABEL}>Correo electrónico</label>
                <Input type="email" value={collaboratorEmail} onChange={e => setCollaboratorEmail(e.target.value)} className={FIELD} />
              </div>
              <div>
                <label className={LABEL}>Responsabilidades</label>
                <textarea value={responsibilities} onChange={e => setResponsibilities(e.target.value)} placeholder="Describe las funciones y entregables del colaborador..." className="flex w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-brand resize-none min-h-[80px]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Compensación (MXN)</label>
                  <Input type="number" min="0" step="0.01" value={compensation} onChange={e => setCompensation(e.target.value)} className={FIELD} />
                </div>
                <div>
                  <label className={LABEL}>Periodicidad de pago</label>
                  <select value={paymentFrequency} onChange={e => setPaymentFrequency(e.target.value)} className={SEL}>
                    <option>Mensual</option>
                    <option>Quincenal</option>
                    <option>Por proyecto</option>
                    <option>Por entregable</option>
                    <option>Único</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Fecha de inicio</label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={FIELD} />
                </div>
                <div>
                  <label className={LABEL}>Fecha de fin</label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={FIELD} />
                </div>
              </div>
            </>
          )}

          <div>
            <label className={LABEL}>Cláusulas y condiciones</label>
            <textarea value={clauses} onChange={e => setClauses(e.target.value)} className="flex w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-brand resize-none min-h-[120px]" required />
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-[#0a0a0a] pb-4">
            <Button type="button" variant="ghost" onClick={() => setPanelOpen(false)} className="flex-1 border border-white/10 text-gray-400 hover:text-white">Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-[2] bg-brand text-black hover:bg-brand/90 font-bold hover:shadow-glow">
              {loading
                ? <span className="animate-pulse">Guardando...</span>
                : <><FileSignature className="w-4 h-4 mr-1.5" />{editingId ? 'Guardar Cambios' : 'Guardar Contrato'}</>
              }
            </Button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}
