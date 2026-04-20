import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SlidePanel } from '../components/ui/SlidePanel';
import { getStorageData, setStorageData } from '../lib/utils';
import { Plus, Trash2, Briefcase, Phone, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const LABEL = 'text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block';
const FIELD = 'bg-black/60 border-white/10 text-white placeholder:text-white/20';
const SEL   = 'flex h-9 w-full rounded-md border border-white/10 bg-black/60 px-3 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand';

const TYPE_COLORS = {
  'Tecnología': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Logística':  'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'Materiales': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'Servicios':  'bg-brand/10 text-brand border-brand/30',
  'Otro':       'bg-white/5 text-gray-400 border-white/10',
};

export function Suppliers() {
  const [suppliers, setSuppliers]     = useState([]);
  const [panelOpen, setPanelOpen]     = useState(false);
  const [name, setName]               = useState('');
  const [contact, setContact]         = useState('');
  const [email, setEmail]             = useState('');
  const [website, setWebsite]         = useState('');
  const [type, setType]               = useState('Tecnología');
  const [confirmDelete, setConfDel]   = useState(null);
  const [loading, setLoading]         = useState(false);

  useEffect(() => { const load = async () => setSuppliers(await getStorageData('solno_suppliers', [])); load(); }, []);

  const resetForm = () => { setName(''); setContact(''); setEmail(''); setWebsite(''); setType('Tecnología'); };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 380));
    const updated = [...suppliers, { id: Date.now(), name, contact, email, website, type }];
    setSuppliers(updated);
    await setStorageData('solno_suppliers', updated);
    window.dispatchEvent(new Event('solno_data_updated'));
    setLoading(false);
    resetForm();
    setPanelOpen(false);
    toast.success('Proveedor registrado', { description: `${name} fue añadido al directorio.` });
  };

  const handleDelete = async (id) => {
    const updated = suppliers.filter(s => s.id !== id);
    setSuppliers(updated);
    await setStorageData('solno_suppliers', updated);
    window.dispatchEvent(new Event('solno_data_updated'));
    setConfDel(null);
    toast.error('Proveedor eliminado');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-brand" /> Proveedores
          </h1>
          <p className="text-gray-400 mt-2">Directorio de empresas y socios comerciales estratégicos.</p>
        </div>
        <Button onClick={() => { resetForm(); setPanelOpen(true); }}
          className="bg-brand text-black hover:bg-brand/90 hover:shadow-glow font-bold shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Proveedor
        </Button>
      </div>

      <Card className="glass border-white/5">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white font-bold">Directorio de Proveedores</CardTitle>
            <span className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-400">{suppliers.length} registros</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Briefcase className="w-14 h-14 text-white/8 mb-4" />
              <p className="text-white font-medium">Sin proveedores registrados</p>
              <p className="text-sm text-gray-500 mt-1 mb-4">Agrega tu primer proveedor al directorio.</p>
              <Button onClick={() => setPanelOpen(true)} className="bg-brand text-black font-bold hover:shadow-glow">
                <Plus className="w-4 h-4 mr-2" /> Agregar Proveedor
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              <AnimatePresence>
                {suppliers.map(sup => (
                  <motion.div key={sup.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between px-6 py-4 hover:bg-white/2 group">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {sup.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{sup.name}</p>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          {sup.contact && <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-white/25" /><span className="text-xs text-gray-400">{sup.contact}</span></div>}
                          {sup.website && (
                            <a href={sup.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-brand transition-colors">
                              <Globe className="w-3 h-3 text-white/25" /><span className="text-xs text-gray-400 hover:text-brand">Sitio web</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${TYPE_COLORS[sup.type] || TYPE_COLORS['Otro']}`}>{sup.type}</span>
                      {confirmDelete === sup.id ? (
                        <div className="flex items-center gap-1">
                          <Button size="sm" onClick={() => handleDelete(sup.id)} className="bg-danger text-white h-7 px-2 text-xs">Sí</Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfDel(null)} className="text-gray-400 h-7 px-2 text-xs">No</Button>
                        </div>
                      ) : (
                        <Button variant="ghost" onClick={() => setConfDel(sup.id)}
                          className="text-white/15 hover:text-danger hover:bg-danger/10 p-2 h-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)}
        title="Nuevo Proveedor" subtitle="Módulo de Proveedores · Solno Sistema"
        icon={Briefcase} accentColor="text-brand">
        <form onSubmit={handleAdd} className="space-y-5">
          <div><label className={LABEL}>Nombre de la Empresa *</label>
            <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Ej. Tecnologías S.A." className={FIELD} /></div>
          <div><label className={LABEL}>Teléfono de Contacto</label>
            <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="+52 55 0000 0000" className={FIELD} /></div>
          <div><label className={LABEL}>Correo Electrónico</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ventas@empresa.com" className={FIELD} /></div>
          <div><label className={LABEL}>Sitio Web</label>
            <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://empresa.com" className={FIELD} /></div>
          <div><label className={LABEL}>Tipo de Proveedor</label>
            <select value={type} onChange={e => setType(e.target.value)} className={SEL}>
              <option>Tecnología</option><option>Logística</option><option>Materiales</option><option>Servicios</option><option>Otro</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setPanelOpen(false)} className="flex-1 border border-white/10 text-gray-400 hover:text-white">Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-brand text-black hover:bg-brand/90 font-bold hover:shadow-glow">
              {loading ? <span className="animate-pulse">Registrando...</span> : <><Plus className="w-4 h-4 mr-1.5" />Agregar</>}
            </Button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}
