import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SlidePanel } from '../components/ui/SlidePanel';
import { getStorageData, setStorageData } from '../lib/utils';
import { Plus, Trash2, FolderGit2, Calendar, CheckCircle2, Globe, Monitor, Server, Wrench, Headphones, BarChart2, Tag, Zap, Briefcase, Star, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const WEB_PACKAGES = [
  { value: 'Básico',          Icon: Zap,          desc: 'Para iniciar presencia en internet',             color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { value: 'Profesional',     Icon: Briefcase,    desc: 'Para negocios en crecimiento',                   color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { value: 'Premium',         Icon: Star,         desc: 'Proyectos más completos y avanzados',            color: 'bg-brand/10 text-brand border-brand/30' },
  { value: 'Tienda en Línea', Icon: ShoppingCart, desc: 'Para venta de productos en internet',            color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
];

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

export function Projects() {
  const [projects, setProjects]       = useState([]);
  const [panelOpen, setPanelOpen]     = useState(false);
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate]         = useState('');
  const [status, setStatus]           = useState('Activo');
  const [type, setType]               = useState('Web');
  const [webPackage, setWebPackage]   = useState('');
  const [confirmDelete, setConfDel]   = useState(null);
  const [loading, setLoading]         = useState(false);

  useEffect(() => { const load = async () => setProjects(await getStorageData('solno_projects', [])); load(); }, []);

  const resetForm = () => { setName(''); setDescription(''); setDueDate(''); setStatus('Activo'); setType('Web'); setWebPackage(''); };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !dueDate) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 380));
    const updated = [...projects, { id: Date.now(), name, description, dueDate, status, type, webPackage: type === 'Web' ? webPackage : '', createdAt: new Date().toISOString() }];
    setProjects(updated);
    await setStorageData('solno_projects', updated);
    window.dispatchEvent(new Event('solno_data_updated'));
    setLoading(false);
    resetForm();
    setPanelOpen(false);
    toast.success('Proyecto creado', { description: `"${name}" fue registrado exitosamente.` });
  };

  const handleDelete = async (id) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    await setStorageData('solno_projects', updated);
    window.dispatchEvent(new Event('solno_data_updated'));
    setConfDel(null);
    toast.error('Proyecto eliminado');
  };

  const toggleStatus = async (project) => {
    const updated = projects.map(p =>
      p.id === project.id ? { ...p, status: p.status === 'Activo' ? 'Completado' : 'Activo' } : p
    );
    setProjects(updated);
    await setStorageData('solno_projects', updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <FolderGit2 className="w-8 h-8 text-brand" /> Proyectos
          </h1>
          <p className="text-gray-400 mt-2">Gestión de iniciativas para vincular tickets y recursos.</p>
        </div>
        <Button onClick={() => { resetForm(); setPanelOpen(true); }}
          className="bg-brand text-black hover:bg-brand/90 hover:shadow-glow font-bold shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Proyecto
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="glass rounded-2xl border border-white/5 flex flex-col items-center justify-center py-24 text-center">
          <FolderGit2 className="w-14 h-14 text-white/8 mb-4" />
          <p className="text-white font-medium text-lg">Sin proyectos registrados</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">Crea tu primer proyecto para empezar a organizar tickets y tareas.</p>
          <Button onClick={() => setPanelOpen(true)} className="bg-brand text-black font-bold hover:shadow-glow">
            <Plus className="w-4 h-4 mr-2" /> Crear Proyecto
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {projects.map(project => {
              const typeObj = PROJECT_TYPES.find(x => x.value === project.type);
              const pkgObj  = WEB_PACKAGES.find(x => x.value === project.webPackage);
              const done    = project.status === 'Completado';
              const TypeIcon = typeObj?.Icon || FolderGit2;

              return (
                <motion.div key={project.id}
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.93 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  layout
                >
                  <div className={`relative rounded-2xl border overflow-hidden group transition-all duration-200 ${
                    done
                      ? 'border-green-500/15 bg-black/40 opacity-70'
                      : 'border-white/8 bg-[#080808] hover:border-brand/30 hover:shadow-[0_0_32px_rgba(204,255,0,0.06)]'
                  }`}>

                    {/* ── Gradient header ── */}
                    <div className="relative px-5 pt-5 pb-4 overflow-hidden"
                      style={{
                        background: done
                          ? 'linear-gradient(135deg,rgba(34,197,94,0.06) 0%,transparent 70%)'
                          : typeObj
                            ? `linear-gradient(135deg,${typeObj.color.includes('blue') ? 'rgba(59,130,246,0.07)' : typeObj.color.includes('purple') ? 'rgba(168,85,247,0.07)' : typeObj.color.includes('orange') ? 'rgba(249,115,22,0.07)' : typeObj.color.includes('yellow') ? 'rgba(234,179,8,0.07)' : typeObj.color.includes('pink') ? 'rgba(236,72,153,0.07)' : 'rgba(204,255,0,0.07)'} 0%,transparent 70%)`
                            : 'linear-gradient(135deg,rgba(204,255,0,0.05) 0%,transparent 70%)'
                      }}
                    >
                      {/* Glow orb behind icon */}
                      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-30 pointer-events-none"
                        style={{ background: done ? '#22c55e' : typeObj?.color.includes('blue') ? '#3b82f6' : typeObj?.color.includes('purple') ? '#a855f7' : '#ccff00' }} />

                      {/* Top row: icon + status */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${done ? 'bg-green-500/10 border-green-500/25' : typeObj ? typeObj.color : 'bg-brand/10 border-brand/25'}`}>
                          {done
                            ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                            : <TypeIcon className="w-5 h-5" />
                          }
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                            done ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-brand/10 text-brand border-brand/20'
                          }`}>{project.status}</span>

                          {/* Type + package badges */}
                          <div className="flex flex-wrap justify-end gap-1">
                            {typeObj && (
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border ${typeObj.color}`}>
                                {typeObj.value}
                              </span>
                            )}
                            {pkgObj && (
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${pkgObj.color}`}>
                                Paq. {pkgObj.value}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-extrabold text-white leading-tight tracking-tight">{project.name}</h3>

                      {/* Description */}
                      <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed min-h-[32px]">
                        {project.description || 'Sin descripción proporcionada.'}
                      </p>
                    </div>

                    {/* Separator line with gradient */}
                    <div className="h-px mx-5" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.06), transparent)' }} />

                    {/* ── Footer ── */}
                    <div className="px-5 py-3 flex items-center justify-between">
                      {/* Due date */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-brand/70 shrink-0" />
                        <span className="text-gray-500">Límite:</span>
                        <span className="text-white font-medium">
                          {project.dueDate ? new Date(project.dueDate + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => toggleStatus(project)}
                          className={`text-xs h-7 px-2.5 ${done ? 'text-gray-500 hover:text-white' : 'text-green-400 hover:bg-green-400/10'}`}>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          {done ? 'Reabrir' : 'Completar'}
                        </Button>

                        {confirmDelete === project.id ? (
                          <div className="flex items-center gap-1">
                            <Button size="sm" onClick={() => handleDelete(project.id)} className="bg-danger text-white h-7 px-2 text-[10px]">Sí</Button>
                            <Button size="sm" variant="ghost" onClick={() => setConfDel(null)} className="text-gray-400 h-7 px-2 text-[10px]">No</Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => setConfDel(project.id)}
                            className="text-white/10 hover:text-danger hover:bg-danger/10 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      )}

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)}
        title="Nuevo Proyecto" subtitle="Módulo de Proyectos · Solno Sistema"
        icon={FolderGit2} accentColor="text-brand">
        <form onSubmit={handleAdd} className="space-y-5">
          <div><label className={LABEL}>Nombre del Proyecto *</label>
            <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Ej. Migración de Servidores" className={FIELD} /></div>
          <div>
            <label className={LABEL}>Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Detalles del proyecto..." rows={3}
              className="flex w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-brand resize-none" />
          </div>
          <div><label className={LABEL}>Fecha Límite *</label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className={`${FIELD} [color-scheme:dark]`} /></div>
          {/* Type visual picker */}
          <div>
            <label className={LABEL}>Tipo de Proyecto / Servicio</label>
            <div className="grid grid-cols-3 gap-2">
              {PROJECT_TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => setType(t.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-[11px] font-bold uppercase transition-all ${
                    type === t.value
                      ? t.color + ' ring-1 ring-offset-1 ring-offset-black ring-brand'
                      : 'bg-black/60 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
                  }`}>
                  <t.Icon className="w-4 h-4" />{t.value}
                </button>
              ))}
            </div>
          </div>
          {/* Web package — shown only when type === Web */}
          <AnimatePresence>
            {type === 'Web' && (
              <motion.div
                key="web-packages"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <label className={LABEL}>Paquete Web</label>
                <div className="space-y-2">
                  {WEB_PACKAGES.map(pkg => (
                    <button key={pkg.value} type="button"
                      onClick={() => setWebPackage(webPackage === pkg.value ? '' : pkg.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        webPackage === pkg.value
                          ? pkg.color + ' ring-1 ring-offset-1 ring-offset-black ring-brand'
                          : 'bg-black/60 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        webPackage === pkg.value ? pkg.color : 'bg-white/5'
                      }`}>
                        <pkg.Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-wider ${
                          webPackage === pkg.value ? '' : 'text-gray-300'
                        }`}>Paquete {pkg.value}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{pkg.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div><label className={LABEL}>Estado Inicial</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className={SEL}>
              <option>Activo</option><option>Completado</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setPanelOpen(false)} className="flex-1 border border-white/10 text-gray-400 hover:text-white">Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-brand text-black hover:bg-brand/90 font-bold hover:shadow-glow">
              {loading ? <span className="animate-pulse">Creando...</span> : <><Plus className="w-4 h-4 mr-1.5" />Crear Proyecto</>}
            </Button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}
