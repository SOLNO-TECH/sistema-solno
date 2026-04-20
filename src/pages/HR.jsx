import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SlidePanel } from '../components/ui/SlidePanel';
import { getStorageData, setStorageData } from '../lib/utils';
import { Plus, Upload, File, CalendarX, Trophy, Trash2, Users, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const LABEL = 'text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block';
const FIELD = 'bg-black/60 border-white/10 text-white placeholder:text-white/20';
const SEL   = 'flex h-9 w-full rounded-md border border-white/10 bg-black/60 px-3 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand';

export function HR() {
  const [employees, setEmployees]   = useState([]);
  const [panelOpen, setPanelOpen]   = useState(false);
  const [empName, setEmpName]       = useState('');
  const [empRole, setEmpRole]       = useState('');
  const [empDept, setEmpDept]       = useState('General');
  const [empPhone, setEmpPhone]     = useState('');
  const [confirmDelete, setConfDel] = useState(null);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    const load = async () => setEmployees(await getStorageData('solno_hr', []));
    load();
  }, []);

  const saveState = async (data) => {
    setEmployees(data);
    await setStorageData('solno_hr', data);
  };

  const resetForm = () => {
    setEmpName(''); setEmpRole(''); setEmpDept('General'); setEmpPhone('');
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!empName) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 380));
    const newEmp = {
      id: Date.now(),
      name: empName,
      role: empRole,
      dept: empDept,
      phone: empPhone,
      files: [],
      faltas: 0,
      bonos: 0,
      joinedAt: new Date().toLocaleDateString('es-MX'),
    };
    const updated = [...employees, newEmp];
    saveState(updated);
    setLoading(false);
    resetForm();
    setPanelOpen(false);
    toast.success('Empleado registrado', { description: `${empName} fue añadido al expediente.` });
  };

  const addFalta = (id) => {
    saveState(employees.map(e => e.id === id ? { ...e, faltas: e.faltas + 1 } : e));
    toast('Falta registrada', { description: 'Se añadió 1 falta al expediente del empleado.' });
  };

  const addBono = (id) => {
    saveState(employees.map(e => e.id === id ? { ...e, bonos: e.bonos + 1 } : e));
    toast.success('Bono añadido', { description: 'El bono de puntualidad fue registrado.' });
  };

  const handleFileUpload = (id) => {
    const fileName = `Documento_${Math.floor(Math.random() * 9000) + 1000}.pdf`;
    saveState(employees.map(e => e.id === id ? { ...e, files: [...e.files, fileName] } : e));
    toast.success('Archivo cargado', { description: `${fileName} fue añadido al expediente.` });
  };

  const deleteEmployee = (id) => {
    saveState(employees.filter(e => e.id !== id));
    setConfDel(null);
    toast.error('Empleado eliminado del sistema.');
  };

  const DEPT_COLORS = {
    'General':    'bg-white/5 text-gray-400 border-white/10',
    'Técnico':    'bg-blue-500/10 text-blue-400 border-blue-500/30',
    'Ventas':     'bg-brand/10 text-brand border-brand/30',
    'Soporte':    'bg-purple-500/10 text-purple-400 border-purple-500/30',
    'Operaciones':'bg-orange-500/10 text-orange-400 border-orange-500/30',
    'Dirección':  'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-brand" /> Recursos Humanos
          </h1>
          <p className="text-gray-400 mt-2">Gestión de personal, expedientes, faltas y bonos de puntualidad.</p>
        </div>
        <Button onClick={() => { resetForm(); setPanelOpen(true); }}
          className="bg-brand text-black hover:bg-brand/90 hover:shadow-glow font-bold shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Empleado
        </Button>
      </div>

      {/* Employee Cards */}
      {employees.length === 0 ? (
        <div className="glass rounded-2xl border border-white/5 border-dashed flex flex-col items-center justify-center py-24 text-center">
          <Users className="w-14 h-14 text-white/8 mb-4" />
          <p className="text-white font-medium text-lg">Sin empleados registrados</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">Agrega tu primer empleado para comenzar a gestionar el personal.</p>
          <Button onClick={() => setPanelOpen(true)} className="bg-brand text-black font-bold hover:shadow-glow">
            <Plus className="w-4 h-4 mr-2" /> Registrar Empleado
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {employees.map(emp => (
              <motion.div key={emp.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <Card className="glass border border-white/8 hover:border-white/20 transition-all group">
                  {/* Card header */}
                  <CardHeader className="pb-3 border-b border-white/5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/30 flex items-center justify-center text-sm font-extrabold text-brand shrink-0">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-white text-sm leading-tight truncate">{emp.name}</h3>
                          {emp.role && <p className="text-xs text-gray-400 mt-0.5 truncate">{emp.role}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${DEPT_COLORS[emp.dept] || DEPT_COLORS['General']}`}>
                          {emp.dept}
                        </span>
                        {confirmDelete === emp.id ? (
                          <div className="flex items-center gap-1">
                            <Button size="sm" onClick={() => deleteEmployee(emp.id)} className="bg-danger text-white h-6 px-2 text-[10px]">Sí</Button>
                            <Button size="sm" variant="ghost" onClick={() => setConfDel(null)} className="text-gray-400 h-6 px-2 text-[10px]">No</Button>
                          </div>
                        ) : (
                          <Button variant="ghost" onClick={() => setConfDel(emp.id)}
                            className="text-white/15 hover:text-danger hover:bg-danger/10 p-1.5 h-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {emp.joinedAt && (
                      <p className="text-[10px] text-gray-600 mt-2 font-medium">Ingreso: {emp.joinedAt}</p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4 pt-4">
                    {/* Faltas + Bonos */}
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => addFalta(emp.id)}
                        className="flex flex-col items-center gap-1 p-3 rounded-xl border border-danger/20 bg-danger/5 hover:bg-danger/10 hover:border-danger/40 transition-all group/btn">
                        <CalendarX className="w-5 h-5 text-danger" />
                        <span className="text-xl font-bold text-danger">{emp.faltas}</span>
                        <span className="text-[10px] text-danger/70 font-medium uppercase tracking-wider">Faltas</span>
                      </button>
                      <button onClick={() => addBono(emp.id)}
                        className="flex flex-col items-center gap-1 p-3 rounded-xl border border-brand/20 bg-brand/5 hover:bg-brand/10 hover:border-brand/40 transition-all group/btn">
                        <Trophy className="w-5 h-5 text-brand" />
                        <span className="text-xl font-bold text-brand">{emp.bonos}</span>
                        <span className="text-[10px] text-brand/70 font-medium uppercase tracking-wider">Bonos</span>
                      </button>
                    </div>

                    {/* Files / Expediente */}
                    <div className="border-t border-white/5 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expediente</span>
                        <Button variant="ghost" size="sm" onClick={() => handleFileUpload(emp.id)}
                          className="text-brand hover:text-brand hover:bg-brand/10 h-7 px-2 text-xs border border-brand/20">
                          <Upload className="w-3 h-3 mr-1" /> Subir
                        </Button>
                      </div>
                      {emp.files.length === 0 ? (
                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-white/3 rounded-lg p-2 border border-white/5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          Sin archivos en el expediente.
                        </div>
                      ) : (
                        <ul className="space-y-1">
                          {emp.files.map((file, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-gray-400 bg-white/3 rounded-lg px-2 py-1.5 border border-white/5">
                              <File className="w-3 h-3 text-brand shrink-0" />
                              <span className="truncate">{file}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* SlidePanel for new employee */}
      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)}
        title="Nuevo Empleado" subtitle="Recursos Humanos · Solno Sistema"
        icon={Users} accentColor="text-brand">
        <form onSubmit={handleAddEmployee} className="space-y-5">
          <div>
            <label className={LABEL}>Nombre Completo *</label>
            <Input value={empName} onChange={e => setEmpName(e.target.value)} required
              placeholder="Ej. Ana Martínez" className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>Puesto / Cargo</label>
            <Input value={empRole} onChange={e => setEmpRole(e.target.value)}
              placeholder="Ej. Técnico de Redes" className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>Departamento</label>
            <select value={empDept} onChange={e => setEmpDept(e.target.value)} className={SEL}>
              <option>General</option>
              <option>Técnico</option>
              <option>Ventas</option>
              <option>Soporte</option>
              <option>Operaciones</option>
              <option>Dirección</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Teléfono</label>
            <Input value={empPhone} onChange={e => setEmpPhone(e.target.value)}
              placeholder="+52 55 0000 0000" className={FIELD} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setPanelOpen(false)}
              className="flex-1 border border-white/10 text-gray-400 hover:text-white">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}
              className="flex-1 bg-brand text-black hover:bg-brand/90 font-bold hover:shadow-glow">
              {loading
                ? <span className="animate-pulse">Registrando...</span>
                : <><Plus className="w-4 h-4 mr-1.5" />Registrar</>}
            </Button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}
