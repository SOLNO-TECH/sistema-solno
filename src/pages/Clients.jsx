import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SlidePanel } from '../components/ui/SlidePanel';
import { getStorageData, setStorageData } from '../lib/utils';
import { Plus, Trash2, Users as UsersIcon, Building2, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const LABEL = 'text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block';
const FIELD = 'bg-black/60 border-white/10 text-white placeholder:text-white/20';

export function Clients() {
  const [clients, setClients]         = useState([]);
  const [panelOpen, setPanelOpen]     = useState(false);
  const [firstName, setFirstName]     = useState('');
  const [lastName, setLastName]       = useState('');
  const [company, setCompany]         = useState('');
  const [phone, setPhone]             = useState('');
  const [email, setEmail]             = useState('');
  const [confirmDelete, setConfDel]   = useState(null);
  const [loading, setLoading]         = useState(false);

  useEffect(() => { const load = async () => setClients(await getStorageData('solno_clients', [])); load(); }, []);

  const resetForm = () => { setFirstName(''); setLastName(''); setCompany(''); setPhone(''); setEmail(''); };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 380));
    const updated = [...clients, { id: Date.now(), firstName, lastName, company, phone, email }];
    setClients(updated);
    await setStorageData('solno_clients', updated);
    window.dispatchEvent(new Event('solno_data_updated'));
    setLoading(false);
    resetForm();
    setPanelOpen(false);
    toast.success('Cliente registrado', { description: `${firstName} ${lastName} fue añadido al directorio.` });
  };

  const handleDelete = async (id) => {
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    await setStorageData('solno_clients', updated);
    window.dispatchEvent(new Event('solno_data_updated'));
    setConfDel(null);
    toast.error('Cliente eliminado');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-brand" /> Clientes
          </h1>
          <p className="text-gray-400 mt-2">Directorio de clientes vinculado al módulo de cotizaciones.</p>
        </div>
        <Button onClick={() => { resetForm(); setPanelOpen(true); }}
          className="bg-brand text-black hover:bg-brand/90 hover:shadow-glow font-bold shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Cliente
        </Button>
      </div>

      <Card className="glass border-white/5">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white font-bold">Directorio de Clientes</CardTitle>
            <span className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-400">{clients.length} registros</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <UsersIcon className="w-14 h-14 text-white/8 mb-4" />
              <p className="text-white font-medium">Sin clientes registrados</p>
              <p className="text-sm text-gray-500 mt-1 mb-4">Agrega tu primer cliente al directorio.</p>
              <Button onClick={() => setPanelOpen(true)} className="bg-brand text-black font-bold hover:shadow-glow">
                <Plus className="w-4 h-4 mr-2" /> Registrar Cliente
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              <AnimatePresence>
                {clients.map(client => (
                  <motion.div key={client.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between px-6 py-4 hover:bg-white/2 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400">
                        {client.firstName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{client.firstName} {client.lastName}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          {client.company && <div className="flex items-center gap-1"><Building2 className="w-3 h-3 text-white/25" /><span className="text-xs text-gray-400">{client.company}</span></div>}
                          {client.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-white/25" /><span className="text-xs text-gray-400">{client.phone}</span></div>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {confirmDelete === client.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-danger">¿Confirmar?</span>
                          <Button size="sm" onClick={() => handleDelete(client.id)} className="bg-danger text-white h-7 px-2 text-xs">Sí</Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfDel(null)} className="text-gray-400 h-7 px-2 text-xs">No</Button>
                        </div>
                      ) : (
                        <Button variant="ghost" onClick={() => setConfDel(client.id)}
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
        title="Nuevo Cliente" subtitle="Módulo de Clientes · Solno Sistema"
        icon={UsersIcon} accentColor="text-brand">
        <form onSubmit={handleAdd} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={LABEL}>Nombre(s) *</label>
              <Input value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="Carlos" className={FIELD} /></div>
            <div><label className={LABEL}>Apellidos *</label>
              <Input value={lastName} onChange={e => setLastName(e.target.value)} required placeholder="Gómez" className={FIELD} /></div>
          </div>
          <div><label className={LABEL}>Empresa</label>
            <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Nombre de la empresa" className={FIELD} /></div>
          <div><label className={LABEL}>Teléfono</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+52 55 0000 0000" className={FIELD} /></div>
          <div><label className={LABEL}>Correo Electrónico</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="cliente@email.com" className={FIELD} /></div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setPanelOpen(false)} className="flex-1 border border-white/10 text-gray-400 hover:text-white">Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-brand text-black hover:bg-brand/90 font-bold hover:shadow-glow">
              {loading ? <span className="animate-pulse">Registrando...</span> : <><Plus className="w-4 h-4 mr-1.5" />Registrar</>}
            </Button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}
