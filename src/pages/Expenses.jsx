import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SlidePanel } from '../components/ui/SlidePanel';
import { getStorageData, setStorageData } from '../lib/utils';
import { Plus, Trash2, CreditCard, ArrowDownRight, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const LABEL = 'text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block';
const FIELD = 'bg-black/60 border-white/10 text-white placeholder:text-white/20';
const SEL   = 'flex h-9 w-full rounded-md border border-white/10 bg-black/60 px-3 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand';

const CAT_COLORS = {
  'Operativo':    'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Nómina':       'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'Equipamiento': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'Marketing':    'bg-brand/10 text-brand border-brand/30',
  'Otro':         'bg-white/5 text-gray-400 border-white/10',
};

export function Expenses() {
  const [expenses, setExpenses]       = useState([]);
  const [panelOpen, setPanelOpen]     = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount]           = useState('');
  const [category, setCategory]       = useState('Operativo');
  const [date, setDate]               = useState(new Date().toISOString().split('T')[0]);
  const [confirmDelete, setConfDel]   = useState(null);
  const [loading, setLoading]         = useState(false);

  useEffect(() => { const load = async () => setExpenses(await getStorageData('solno_expenses', [])); load(); }, []);

  const resetForm = () => { setDescription(''); setAmount(''); setCategory('Operativo'); setDate(new Date().toISOString().split('T')[0]); };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 380));
    const updated = [{ id: Date.now(), description, amount: parseFloat(amount), category, date: new Date(date + 'T00:00:00').toLocaleDateString('es-MX') }, ...expenses];
    setExpenses(updated);
    await setStorageData('solno_expenses', updated);
    window.dispatchEvent(new Event('solno_data_updated'));
    setLoading(false);
    resetForm();
    setPanelOpen(false);
    toast.success('Gasto registrado', { description: `$${parseFloat(amount).toLocaleString()} — "${description}"` });
  };

  const handleDelete = async (id) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    await setStorageData('solno_expenses', updated);
    window.dispatchEvent(new Event('solno_data_updated'));
    setConfDel(null);
    toast.error('Gasto eliminado');
  };

  const total = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-danger" /> Gastos Operativos
          </h1>
          <p className="text-gray-400 mt-2">Registro y control de los egresos de la empresa.</p>
        </div>
        <Button onClick={() => { resetForm(); setPanelOpen(true); }}
          className="bg-danger text-white hover:bg-danger/90 font-bold shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Registrar Gasto
        </Button>
      </div>

      <Card className="glass border-white/5">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white font-bold">Historial de Gastos</CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-danger" />
                <span className="text-sm font-bold text-danger">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <span className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-400">{expenses.length} registros</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CreditCard className="w-14 h-14 text-white/8 mb-4" />
              <p className="text-white font-medium">Sin gastos registrados</p>
              <p className="text-sm text-gray-500 mt-1 mb-4">Registra el primer egreso de la empresa.</p>
              <Button onClick={() => setPanelOpen(true)} className="bg-danger text-white font-bold">
                <Plus className="w-4 h-4 mr-2" /> Registrar Gasto
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              <AnimatePresence>
                {expenses.map(exp => (
                  <motion.div key={exp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between px-6 py-4 hover:bg-white/2 group">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center shrink-0">
                        <ArrowDownRight className="w-4 h-4 text-danger" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{exp.description}</p>
                        <span className="text-xs text-gray-400">{exp.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${CAT_COLORS[exp.category] || CAT_COLORS['Otro']}`}>{exp.category}</span>
                      <span className="text-sm font-bold text-danger">${(exp.amount || 0).toLocaleString()}</span>
                      {confirmDelete === exp.id ? (
                        <div className="flex items-center gap-1">
                          <Button size="sm" onClick={() => handleDelete(exp.id)} className="bg-danger text-white h-7 px-2 text-xs">Sí</Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfDel(null)} className="text-gray-400 h-7 px-2 text-xs">No</Button>
                        </div>
                      ) : (
                        <Button variant="ghost" onClick={() => setConfDel(exp.id)}
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
        title="Registrar Gasto" subtitle="Módulo de Gastos · Solno Sistema"
        icon={CreditCard} accentColor="text-danger">
        <form onSubmit={handleAdd} className="space-y-5">
          <div><label className={LABEL}>Descripción *</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} required placeholder="Ej. Renta de oficina" className={FIELD} /></div>
          <div><label className={LABEL}>Monto (MXN) *</label>
            <Input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="5,000.00" className={FIELD} /></div>
          <div><label className={LABEL}>Categoría</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={SEL}>
              <option>Operativo</option><option>Nómina</option><option>Equipamiento</option><option>Marketing</option><option>Otro</option>
            </select>
          </div>
          <div><label className={LABEL}>Fecha del Gasto</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className={`${FIELD} [color-scheme:dark]`} /></div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setPanelOpen(false)} className="flex-1 border border-white/10 text-gray-400 hover:text-white">Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-danger text-white hover:bg-danger/90 font-bold">
              {loading ? <span className="animate-pulse">Registrando...</span> : <><Plus className="w-4 h-4 mr-1.5" />Registrar</>}
            </Button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}
