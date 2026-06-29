import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getStorageData, setStorageData } from '../lib/utils';
import {
  Plus, Trash2, Ticket, User, FolderGit2,
  GripVertical, Building2, Briefcase, X,
  AlertCircle, ArrowUp, ArrowRight, ArrowDown,
  CheckCircle, Circle, Clock, Loader2, Tag, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'sonner';

// ── Helpers ─────────────────────────────────────────────────────────────────

const PRIORITY_CFG = {
  Alta:  { Icon: ArrowUp,    textCls: 'text-danger',     bgCls: 'bg-danger/10 border-danger/30' },
  Media: { Icon: ArrowRight, textCls: 'text-yellow-400', bgCls: 'bg-yellow-400/10 border-yellow-400/30' },
  Baja:  { Icon: ArrowDown,  textCls: 'text-blue-400',   bgCls: 'bg-blue-400/10 border-blue-400/30' },
};

const INITIAL_COLUMNS = {
  pending:    { id: 'pending',    title: 'Pendiente',    Icon: Circle,       accentColor: '#9ca3af', tickets: [] },
  inProgress: { id: 'inProgress', title: 'En Progreso',  Icon: Loader2,      accentColor: '#ccff00', tickets: [] },
  review:     { id: 'review',     title: 'En Revisión',  Icon: Clock,        accentColor: '#a855f7', tickets: [] },
  completed:  { id: 'completed',  title: 'Completado',   Icon: CheckCircle,  accentColor: '#22c55e', tickets: [] },
};

const SEL = 'flex h-9 w-full rounded-md border border-white/10 bg-black/60 px-3 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand';
const LBL = 'text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block';
const FLD = 'bg-black/60 border-white/10 text-white placeholder:text-white/20';

// ── Ticket Card ──────────────────────────────────────────────────────────────

function TicketCard({ item, index, columnId, users, projects, clients, suppliers, onDelete }) {
  const assignee = users.find(u => u.id === item.assigneeId);
  const P = PRIORITY_CFG[item.priority] || PRIORITY_CFG.Media;

  const getLinked = () => {
    if (item.linkedType === 'project') {
      const p = projects.find(x => x.id === item.linkedId);
      return p ? { text: p.name, Icon: FolderGit2, cls: 'text-blue-400' } : null;
    }
    if (item.linkedType === 'client') {
      const c = clients.find(x => x.id === item.linkedId);
      return c ? { text: `${c.firstName} ${c.lastName}`, Icon: Building2, cls: 'text-purple-400' } : null;
    }
    if (item.linkedType === 'supplier') {
      const s = suppliers.find(x => x.id === item.linkedId);
      return s ? { text: s.name, Icon: Briefcase, cls: 'text-orange-400' } : null;
    }
    return null;
  };

  const linked = getLinked();
  const dateStr = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
    : '';

  return (
    <Draggable draggableId={String(item.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={provided.draggableProps.style}
          className={[
            'mb-3 rounded-xl border p-4 select-none transition-all duration-150 group',
            snapshot.isDragging
              ? 'border-brand/60 shadow-[0_0_24px_rgba(204,255,0,0.2)] scale-[1.02] bg-[#0a0a0a]'
              : 'border-white/8 hover:border-white/20 bg-black/50'
          ].join(' ')}
        >
          {/* Top row: grip + priority + id + delete */}
          <div className="flex items-start gap-2">
            <div
              {...provided.dragHandleProps}
              className="mt-0.5 shrink-0 text-white/15 hover:text-white/50 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {/* Priority badge */}
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${P.bgCls}`}>
                  <P.Icon className={`w-2.5 h-2.5 ${P.textCls}`} />
                  <span className={P.textCls}>{item.priority}</span>
                </span>

                {/* Short ID */}
                <span className="text-[10px] text-white/25 font-mono">#{String(item.id).slice(-5).toUpperCase()}</span>

                {/* Category tag */}
                {item.category && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 bg-white/5 border border-white/8 px-1.5 py-0.5 rounded">
                    <Tag className="w-2.5 h-2.5" />
                    {item.category}
                  </span>
                )}
              </div>

              {/* Title */}
              <h4 className="text-sm font-semibold text-white leading-snug">{item.title}</h4>

              {/* Description */}
              {item.description && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
              )}
            </div>

            {/* Delete btn */}
            <button
              onClick={() => onDelete(item.id, columnId)}
              className="shrink-0 text-white/10 hover:text-danger transition-colors opacity-0 group-hover:opacity-100 mt-0.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Assignee */}
              {assignee ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-[9px] font-bold text-brand">
                    {(assignee.name || assignee.username || '?').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[11px] text-gray-400">{(assignee.name || assignee.username || '?').split(' ')[0]}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-white/20">
                  <User className="w-3 h-3" />
                  <span className="text-[11px]">Sin asignar</span>
                </div>
              )}

              {/* Linked entity */}
              {linked && (
                <span className={`inline-flex items-center gap-1 text-[10px] ${linked.cls} bg-black/40 border border-white/8 px-1.5 py-0.5 rounded max-w-[90px] truncate`}>
                  <linked.Icon className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{linked.text}</span>
                </span>
              )}
            </div>

            {dateStr && (
              <div className="flex items-center gap-1 text-[10px] text-white/20 shrink-0">
                <Calendar className="w-2.5 h-2.5" />
                {dateStr}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ── New Ticket Modal ─────────────────────────────────────────────────────────

function NewTicketModal({ onClose, onSubmit, users, projects, clients, suppliers }) {
  const [title, setTitle]         = useState('');
  const [description, setDesc]    = useState('');
  const [assigneeId, setAssignee] = useState('');
  const [priority, setPriority]   = useState('Media');
  const [category, setCategory]   = useState('');
  const [linkedType, setLinkType] = useState('none');
  const [linkedId, setLinkId]     = useState('');
  const [loading, setLoading]     = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title || !assigneeId) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 350));
    onSubmit({
      id: `ticket-${Date.now()}`,
      title, description,
      assigneeId: parseInt(assigneeId),
      priority, category,
      linkedType,
      linkedId: linkedId ? parseInt(linkedId) : null,
      createdAt: new Date().toISOString(),
    });
    setLoading(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="w-full max-w-lg bg-[#080808] border border-white/10 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.9)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/30 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-brand" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Nuevo Ticket</h2>
              <p className="text-[11px] text-gray-500">Mesa de Servicio · Solno Sistema</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-6 space-y-5">
          <div>
            <label className={LBL}>Título del Problema *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} required autoFocus
              placeholder="Ej. Error 500 en módulo de facturación" className={FLD} />
          </div>

          <div>
            <label className={LBL}>Descripción Detallada</label>
            <textarea value={description} onChange={e => setDesc(e.target.value)}
              placeholder="Describe el problema, pasos para reproducirlo, impacto..." rows={3}
              className="flex w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-brand resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LBL}>Asignar a *</label>
              <select value={assigneeId} onChange={e => setAssignee(e.target.value)} required className={SEL}>
                <option value="">Selecciona usuario...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name || u.username}</option>)}
              </select>
            </div>
            <div>
              <label className={LBL}>Prioridad</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className={SEL}>
                <option>Alta</option>
                <option>Media</option>
                <option>Baja</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LBL}>Categoría</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={SEL}>
                <option value="">Sin categoría</option>
                <option>Bug</option>
                <option>Soporte</option>
                <option>Mejora</option>
                <option>Infraestructura</option>
                <option>Seguridad</option>
              </select>
            </div>
            <div>
              <label className={LBL}>Vincular a</label>
              <select value={linkedType} onChange={e => { setLinkType(e.target.value); setLinkId(''); }} className={SEL}>
                <option value="none">Sin vincular</option>
                <option value="project">Proyecto</option>
                <option value="client">Cliente</option>
                <option value="supplier">Proveedor</option>
              </select>
            </div>
          </div>

          {linkedType !== 'none' && (
            <div>
              <label className={LBL}>{linkedType === 'project' ? 'Proyecto' : linkedType === 'client' ? 'Cliente' : 'Proveedor'}</label>
              <select value={linkedId} onChange={e => setLinkId(e.target.value)} required className={SEL}>
                <option value="">Selecciona...</option>
                {linkedType === 'project'  && projects.map(p  => <option key={p.id} value={p.id}>{p.name}</option>)}
                {linkedType === 'client'   && clients.map(c   => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                {linkedType === 'supplier' && suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}
              className="flex-1 border border-white/10 text-gray-400 hover:text-white">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}
              className="flex-1 bg-brand text-black hover:bg-brand/90 font-bold hover:shadow-glow">
              {loading ? <span className="animate-pulse">Creando...</span> : <><Plus className="w-4 h-4 mr-1.5" />Crear Ticket</>}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function Tickets() {
  const [columns, setColumns]     = useState(INITIAL_COLUMNS);
  const [users, setUsers]         = useState([]);
  const [projects, setProjects]   = useState([]);
  const [clients, setClients]     = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await getStorageData('solno_tickets', null);
        if (stored && typeof stored === 'object') {
          // Merge stored data into initial columns safely
          const merged = { ...INITIAL_COLUMNS };
          Object.keys(merged).forEach(key => {
            if (stored[key] && Array.isArray(stored[key].tickets)) {
              merged[key] = { ...merged[key], tickets: stored[key].tickets };
            }
          });
          setColumns(merged);
        }
      } catch (e) {
        console.warn('Error loading tickets', e);
      }

      setUsers(await getStorageData('solno_users', [{ id: 1, name: 'Admin' }]));
      setProjects(await getStorageData('solno_projects', []));
      setClients(await getStorageData('solno_clients', []));
      setSuppliers(await getStorageData('solno_suppliers', []));
    };
    load();
  }, []);

  const saveBoard = async (newCols) => {
    setColumns(newCols);
    await setStorageData('solno_tickets', newCols);
    window.dispatchEvent(new Event('solno_data_updated'));
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcCol   = columns[source.droppableId];
    const dstCol   = columns[destination.droppableId];

    if (source.droppableId === destination.droppableId) {
      const items = [...srcCol.tickets];
      const [moved] = items.splice(source.index, 1);
      items.splice(destination.index, 0, moved);
      saveBoard({ ...columns, [source.droppableId]: { ...srcCol, tickets: items } });
    } else {
      const srcItems = [...srcCol.tickets];
      const dstItems = [...dstCol.tickets];
      const [moved] = srcItems.splice(source.index, 1);
      dstItems.splice(destination.index, 0, moved);
      saveBoard({
        ...columns,
        [source.droppableId]:      { ...srcCol, tickets: srcItems },
        [destination.droppableId]: { ...dstCol, tickets: dstItems },
      });
    }
  };

  const addTicket = (ticket) => {
    const col = columns.pending;
    saveBoard({ ...columns, pending: { ...col, tickets: [ticket, ...col.tickets] } });
    toast.success('Ticket creado', { description: `"${ticket.title}" añadido a Pendiente.` });
  };

  const deleteTicket = (ticketId, columnId) => {
    const col = columns[columnId];
    saveBoard({ ...columns, [columnId]: { ...col, tickets: col.tickets.filter(t => t.id !== ticketId) } });
    toast.error('Ticket eliminado');
  };

  const totalTickets = Object.values(columns).reduce((s, c) => s + c.tickets.length, 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Ticket className="w-8 h-8 text-brand" /> Mesa de Servicio
          </h1>
          <p className="text-gray-400 mt-1.5">
            Tablero Kanban interactivo ·{' '}
            <span className="text-white/50">{totalTickets} ticket{totalTickets !== 1 ? 's' : ''}</span>
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}
          className="bg-brand text-black hover:bg-brand/90 hover:shadow-glow font-bold shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Ticket
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Object.values(columns).map(col => {
          const ColIcon = col.Icon;
          return (
            <div key={col.id} className="glass rounded-xl p-3 border border-white/5 flex items-center gap-3">
              <ColIcon className="w-4 h-4 shrink-0" style={{ color: col.accentColor }} />
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 truncate">{col.title}</p>
                <p className="text-xl font-bold text-white">{col.tickets.length}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {Object.entries(columns).map(([columnId, column]) => {
            const ColIcon = column.Icon;
            return (
              <div key={columnId} className="flex flex-col">
                {/* Column header */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <ColIcon className="w-4 h-4" style={{ color: column.accentColor }} />
                    <span className="text-sm font-bold text-white">{column.title}</span>
                  </div>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: `${column.accentColor}20`, color: column.accentColor, border: `1px solid ${column.accentColor}40` }}
                  >
                    {column.tickets.length}
                  </span>
                </div>

                {/* Accent line */}
                <div className="h-[2px] mb-3 rounded-full"
                  style={{ background: `linear-gradient(to right, ${column.accentColor}80, transparent)` }} />

                {/* Droppable area */}
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={[
                        'min-h-[400px] rounded-xl p-2 transition-colors duration-150',
                        snapshot.isDraggingOver ? 'bg-white/4 outline outline-1 outline-dashed outline-white/10' : ''
                      ].join(' ')}
                    >
                      {column.tickets.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center h-32">
                          <AlertCircle className="w-6 h-6 text-white/10 mb-1" />
                          <p className="text-xs text-white/20">Sin tickets</p>
                        </div>
                      )}

                      {column.tickets.map((item, index) => (
                        <TicketCard
                          key={item.id}
                          item={item}
                          index={index}
                          columnId={columnId}
                          users={users}
                          projects={projects}
                          clients={clients}
                          suppliers={suppliers}
                          onDelete={deleteTicket}
                        />
                      ))}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <NewTicketModal
            onClose={() => setShowModal(false)}
            onSubmit={addTicket}
            users={users}
            projects={projects}
            clients={clients}
            suppliers={suppliers}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
