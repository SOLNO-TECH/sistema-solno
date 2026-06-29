import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SlidePanel } from '../components/ui/SlidePanel';
import { getStorageData, setStorageData } from '../lib/utils';
import {
  Plus, Trash2, UserCircle, Lock, Eye, EyeOff,
  ShieldCheck, CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const LABEL = 'text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block';
const FIELD = 'bg-black/60 border-white/10 text-white placeholder:text-white/20';
const SEL   = 'flex h-9 w-full rounded-md border border-white/10 bg-black/60 px-3 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand';

const ROLE_COLORS = {
  'Super Admin':   'bg-brand/10 text-brand border-brand/30',
  'Administrador': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Operador':      'bg-white/5 text-gray-400 border-white/10',
};

const ROLE_DESCRIPTIONS = {
  'Super Admin':   'Acceso total al sistema: usuarios, configuración y todos los módulos.',
  'Administrador': 'Acceso a todos los módulos de negocio. No puede gestionar usuarios.',
  'Operador':      'Acceso de lectura y registro básico en módulos asignados.',
};

// Generates a secure random password
function generatePassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function Users() {
  const [users, setUsers]         = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);

  // Form fields
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [role, setRole]           = useState('Operador');
  const [showPass, setShowPass]   = useState(false);

  // Availability state
  const [usernameStatus, setUsernameStatus] = useState('idle'); // idle | available | taken
  const [confirmDelete, setConfDel]         = useState(null);
  const [loading, setLoading]               = useState(false);

  useEffect(() => {
    const load = async () => {
      setUsers(await getStorageData('solno_users', [{
        id: 1, username: 'admin', role: 'Super Admin',
        passwordHash: btoa('admin'), createdAt: 'Sistema'
      }]));
    };
    load();
  }, []);

  // Real-time username availability check
  useEffect(() => {
    if (!username.trim()) { setUsernameStatus('idle'); return; }
    const taken = users.some(u => u.username?.toLowerCase() === username.toLowerCase().trim());
    setUsernameStatus(taken ? 'taken' : 'available');
  }, [username, users]);

  const resetForm = () => {
    setUsername(''); setPassword(''); setRole('Operador'); setShowPass(false); setUsernameStatus('idle');
  };

  const handleGeneratePassword = () => {
    const p = generatePassword(14);
    setPassword(p);
    setShowPass(true);
    toast('Contraseña generada', { description: 'Cópiala antes de cerrar el panel.' });
  };

  const strengthLevel = password.length === 0 ? 0 : password.length < 5 ? 1 : password.length < 9 ? 2 : 3;
  const strengthLabel = ['', 'Débil', 'Media', 'Fuerte'];
  const strengthColor = ['', 'bg-danger', 'bg-yellow-400', 'bg-brand'];

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!username || !password || usernameStatus === 'taken') return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    const newUser = {
      id: Date.now(),
      username: username.toLowerCase().trim(),
      role,
      passwordHash: btoa(password),
      createdAt: new Date().toLocaleDateString('es-MX'),
    };

    const updated = [...users, newUser];
    setUsers(updated);
    await setStorageData('solno_users', updated);
    window.dispatchEvent(new Event('solno_data_updated'));
    setLoading(false);
    resetForm();
    setPanelOpen(false);
    toast.success('Usuario creado', { description: `@${username} tiene acceso como ${role}.` });
  };

  const handleDelete = async (id) => {
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    await setStorageData('solno_users', updated);
    window.dispatchEvent(new Event('solno_data_updated'));
    setConfDel(null);
    toast.error('Usuario eliminado');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-brand" /> Usuarios del Sistema
          </h1>
          <p className="text-gray-400 mt-2">Cuentas con acceso al Panel Administrativo de Solno.</p>
        </div>
        <Button onClick={() => { resetForm(); setPanelOpen(true); }}
          className="bg-brand text-black hover:bg-brand/90 hover:shadow-glow font-bold shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Usuario
        </Button>
      </div>

      <Card className="glass border-white/5">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white font-bold">Control de Accesos</CardTitle>
            <span className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-400">
              {users.length} {users.length === 1 ? 'usuario' : 'usuarios'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <UserCircle className="w-14 h-14 text-white/8 mb-4" />
              <p className="text-white font-medium">Sin usuarios registrados</p>
              <p className="text-sm text-gray-500 mt-1 mb-4">Crea el primer acceso al sistema.</p>
              <Button onClick={() => setPanelOpen(true)} className="bg-brand text-black font-bold hover:shadow-glow">
                <Plus className="w-4 h-4 mr-2" /> Crear Usuario
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              <AnimatePresence>
                {users.map(user => (
                  <motion.div key={user.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between px-6 py-4 hover:bg-white/2 group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {(user.username || user.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white font-mono">@{user.username || user.name}</p>
                          {user.passwordHash && (
                            <div className="flex items-center gap-1">
                              <Lock className="w-3 h-3 text-white/20" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {user.createdAt ? `Creado: ${user.createdAt}` : 'Cuenta del sistema'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${ROLE_COLORS[user.role] || ROLE_COLORS['Operador']}`}>
                        {user.role}
                      </span>
                      {confirmDelete === user.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-danger">¿Confirmar?</span>
                          <Button size="sm" onClick={() => handleDelete(user.id)} className="bg-danger text-white h-7 px-2 text-xs">Sí</Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfDel(null)} className="text-gray-400 h-7 px-2 text-xs">No</Button>
                        </div>
                      ) : (
                        <Button variant="ghost" onClick={() => setConfDel(user.id)}
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

      {/* ── SlidePanel ── */}
      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)}
        title="Nuevo Usuario" subtitle="Control de Accesos · Solno Sistema"
        icon={UserCircle} accentColor="text-brand">
        <form onSubmit={handleAdd} className="space-y-6">

          {/* Username with availability indicator */}
          <div>
            <label className={LABEL}>Nombre de Usuario *</label>
            <div className="relative">
              <Input
                value={username}
                onChange={e => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
                required
                placeholder="Ej. jperez"
                className={`${FIELD} pr-10 font-mono`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <AnimatePresence mode="wait">
                  {usernameStatus === 'available' && (
                    <motion.div key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <CheckCircle2 className="w-4 h-4 text-brand" />
                    </motion.div>
                  )}
                  {usernameStatus === 'taken' && (
                    <motion.div key="taken" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <XCircle className="w-4 h-4 text-danger" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Availability pill */}
            <AnimatePresence>
              {usernameStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`mt-2 inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                    usernameStatus === 'available'
                      ? 'bg-brand/10 text-brand border-brand/30'
                      : 'bg-danger/10 text-danger border-danger/30'
                  }`}
                >
                  {usernameStatus === 'available'
                    ? <><CheckCircle2 className="w-3 h-3" /> Disponible</>
                    : <><XCircle className="w-3 h-3" /> Usuario ya registrado</>
                  }
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`${LABEL} mb-0`}>Contraseña de Acceso *</label>
              <button type="button" onClick={handleGeneratePassword}
                className="flex items-center gap-1 text-[11px] text-brand hover:text-brand/80 font-bold transition-colors">
                <RefreshCw className="w-3 h-3" /> Generar
              </button>
            </div>
            <div className="relative">
              <Input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className={`${FIELD} pr-10 font-mono`}
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength bar */}
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3].map(lvl => (
                    <div key={lvl} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      strengthLevel >= lvl ? strengthColor[strengthLevel] : 'bg-white/10'
                    }`} />
                  ))}
                </div>
                <span className={`text-[10px] font-bold ${
                  strengthLevel === 3 ? 'text-brand' : strengthLevel === 2 ? 'text-yellow-400' : 'text-danger'
                }`}>{strengthLabel[strengthLevel]}</span>
              </div>
            )}
          </div>

          {/* Role */}
          <div>
            <label className={LABEL}>Rol del Sistema</label>
            <select value={role} onChange={e => setRole(e.target.value)} className={SEL}>
              <option>Super Admin</option>
              <option>Administrador</option>
              <option>Operador</option>
            </select>

            {/* Role description card */}
            <AnimatePresence mode="wait">
              <motion.div key={role}
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className={`mt-2 p-3 rounded-lg border text-xs flex items-start gap-2 ${ROLE_COLORS[role]}`}>
                <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{ROLE_DESCRIPTIONS[role]}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="border-t border-white/5" />

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setPanelOpen(false)}
              className="flex-1 border border-white/10 text-gray-400 hover:text-white">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || usernameStatus === 'taken' || !username || !password}
              className="flex-1 bg-brand text-black hover:bg-brand/90 font-bold hover:shadow-glow disabled:opacity-40">
              {loading
                ? <span className="animate-pulse">Creando...</span>
                : <><Plus className="w-4 h-4 mr-1.5" />Crear Usuario</>}
            </Button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}
