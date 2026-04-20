import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { getStorageData, setStorageData } from '../lib/utils';
import {
  UserCircle, Mail, Phone, MapPin, Shield, Key, History,
  Smartphone, Camera, Save, CheckCircle2, X, Eye, EyeOff,
  Lock, AlertTriangle, LogIn, Settings, Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LABEL = 'text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block';
const FIELD = 'bg-black/60 border-white/10 text-white placeholder:text-white/20';

async function logActivity(action, type = 'info') {
  const logs = await getStorageData('solno_activity_log', []);
  const entry = {
    id: Date.now(),
    action,
    type, // info | success | warning | danger
    ip: `192.168.1.${Math.floor(Math.random() * 50) + 100}`,
    time: new Date().toISOString(),
  };
  const updated = [entry, ...logs].slice(0, 50); // keep last 50
  await setStorageData('solno_activity_log', updated);
  return updated;
}

function formatTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Hace un momento';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH}h`;
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const TYPE_COLORS = {
  success: 'text-brand',
  info:    'text-blue-400',
  warning: 'text-yellow-400',
  danger:  'text-danger',
};

// ─── 2FA Modal ────────────────────────────────────────────────────────────────
function TwoFAModal({ enabled, onClose, onToggle }) {
  const [step, setStep] = useState(enabled ? 'disable' : 'setup');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  // Fake TOTP secret (visual only)
  const secret = 'SOLNO-XKCD-7G4P-2024';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/Solno:admin?secret=${secret}&issuer=Solno`;

  const verify = async () => {
    if (code.length !== 6) { setError('El código debe ser de 6 dígitos.'); return; }
    // Accept any 6-digit code for demo
    onToggle(!enabled);
    toast.success(enabled ? '2FA desactivado' : '2FA activado correctamente');
    await logActivity(enabled ? 'Autenticación 2FA desactivada' : 'Autenticación 2FA activada', enabled ? 'warning' : 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-sm bg-[#080808] border border-white/10 rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.9)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gradient-to-r from-brand/5 to-transparent">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-brand" />
            <h2 className="text-sm font-bold text-white">
              {enabled ? 'Desactivar 2FA' : 'Activar Autenticación 2FA'}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-5">
          {!enabled && step === 'setup' && (
            <>
              <p className="text-xs text-gray-400 leading-relaxed">
                Escanea el código QR con tu app de autenticación (Google Authenticator, Authy, etc.)
              </p>
              <div className="flex justify-center">
                <div className="p-3 bg-white rounded-xl">
                  <img src={qrUrl} alt="QR 2FA" className="w-[160px] h-[160px]" />
                </div>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-lg px-4 py-2 text-center">
                <p className="text-[10px] text-gray-500 mb-1">Clave manual</p>
                <p className="text-xs text-brand font-mono font-bold tracking-widest">{secret}</p>
              </div>
              <Button onClick={() => setStep('verify')} className="w-full bg-brand text-black font-bold hover:shadow-glow">
                Continuar → Verificar
              </Button>
            </>
          )}

          {(step === 'verify' || enabled) && (
            <>
              <p className="text-xs text-gray-400">
                {enabled ? 'Ingresa un código de tu app para confirmar la desactivación.' : 'Ingresa el código de 6 dígitos de tu app para confirmar.'}
              </p>
              <Input
                value={code}
                onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                placeholder="000000"
                className={`${FIELD} text-center text-2xl tracking-[0.5em] font-mono`}
                maxLength={6}
                autoFocus
              />
              {error && <p className="text-xs text-danger">{error}</p>}
              <Button onClick={verify} disabled={code.length !== 6}
                className={`w-full font-bold ${enabled ? 'bg-danger text-white hover:bg-danger/90' : 'bg-brand text-black hover:shadow-glow'} disabled:opacity-40`}>
                {enabled ? 'Confirmar Desactivación' : 'Activar 2FA'}
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const [current, setCurrent]   = useState('');
  const [next, setNext]         = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showAll, setShowAll]   = useState(false);
  const [error, setError]       = useState('');

  const save = async () => {
    const users = await getStorageData('solno_users', []);
    const cu = JSON.parse(localStorage.getItem('solno_current_user') || 'null');
    if (!cu) { setError('No hay sesión activa.'); return; }
    const user = users.find(u => u.id === cu.id);
    if (!user || user.passwordHash !== btoa(current)) { setError('Contraseña actual incorrecta.'); return; }
    if (next.length < 6) { setError('La nueva contraseña debe tener al menos 6 caracteres.'); return; }
    if (next !== confirm) { setError('Las contraseñas no coinciden.'); return; }

    const updated = users.map(u => u.id === cu.id ? { ...u, passwordHash: btoa(next) } : u);
    await setStorageData('solno_users', updated);
    localStorage.setItem('solno_current_user', JSON.stringify({ ...cu, passwordHash: btoa(next) }));
    await logActivity('Contraseña de acceso actualizada', 'warning');
    toast.success('Contraseña actualizada');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-[#080808] border border-white/10 rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2"><Key className="w-4 h-4 text-brand" /><h2 className="text-sm font-bold text-white">Cambiar Contraseña</h2></div>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div><label className={LABEL}>Contraseña Actual</label>
            <Input type={showAll ? 'text' : 'password'} value={current} onChange={e => setCurrent(e.target.value)} className={FIELD} placeholder="••••••••" /></div>
          <div><label className={LABEL}>Nueva Contraseña</label>
            <Input type={showAll ? 'text' : 'password'} value={next} onChange={e => setNext(e.target.value)} className={FIELD} placeholder="Mínimo 6 caracteres" /></div>
          <div><label className={LABEL}>Confirmar Nueva Contraseña</label>
            <Input type={showAll ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} className={FIELD} placeholder="Repite la contraseña" /></div>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400">
            <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} className="accent-brand" />
            Mostrar contraseñas
          </label>
          {error && <p className="text-xs text-danger flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={onClose} className="flex-1 border border-white/10 text-gray-400">Cancelar</Button>
            <Button onClick={save} className="flex-1 bg-brand text-black font-bold hover:shadow-glow">Actualizar</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export function Profile() {
  const [profile, setProfile] = useState({
    displayName: '', email: '', phone: '', location: '', bio: '', avatar: null
  });
  const [twoFA, setTwoFA]             = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [show2FA, setShow2FA]         = useState(false);
  const [showPassModal, setShowPass]  = useState(false);
  const [editing, setEditing]         = useState(false);
  const [draft, setDraft]             = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const fileRef                       = useRef(null);

  useEffect(() => {
    const load = async () => {
      // Load current user
      const cu = JSON.parse(localStorage.getItem('solno_current_user') || 'null');
      setCurrentUser(cu);

      // Load real profile data from solno_users
      const users = await getStorageData('solno_users', []);
      const user = users.find(u => u.id === cu?.id) || cu || {};

      const saved = {
        displayName: user.displayName || user.username || 'Admin',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        avatar: user.avatar || null,
      };
      setProfile(saved);
      setTwoFA(user.twoFA || await getStorageData('solno_2fa_enabled', false));

      // Load or seed activity log
      let logs = await getStorageData('solno_activity_log', []);
      if (logs.length === 0) {
        logs = await logActivity('Inicio de sesión exitoso', 'success');
      }
      setActivityLog(logs);
    };
    load();
  }, []);

  const startEdit = () => { setDraft({ ...profile }); setEditing(true); };
  const cancelEdit = () => { setEditing(false); setDraft({}); };

  const saveProfile = async () => {
    setProfile(draft);
    
    // Guardar en el usuario real en SQLite
    const users = await getStorageData('solno_users', []);
    if (currentUser) {
       const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, ...draft } : u);
       await setStorageData('solno_users', updatedUsers);
       
       const newCu = { ...currentUser, ...draft };
       setCurrentUser(newCu);
       localStorage.setItem('solno_current_user', JSON.stringify(newCu));
       window.dispatchEvent(new Event('solno_data_updated'));
    }

    const newLog = await logActivity('Perfil de usuario actualizado', 'info');
    setActivityLog(newLog);
    setEditing(false);
    toast.success('Perfil actualizado', { description: 'Tus datos fueron guardados correctamente.' });
  };

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('La imagen no puede superar 2MB'); return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const avatar = ev.target.result;
      const updatedProfile = { ...profile, avatar };
      setProfile(updatedProfile);
      setDraft(d => ({ ...d, avatar }));
      
      const users = await getStorageData('solno_users', []);
      if (currentUser) {
         const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, avatar } : u);
         await setStorageData('solno_users', updatedUsers);
         const newCu = { ...currentUser, avatar };
         setCurrentUser(newCu);
         localStorage.setItem('solno_current_user', JSON.stringify(newCu));
         window.dispatchEvent(new Event('solno_data_updated'));
      }

      const newLog = await logActivity('Foto de perfil actualizada', 'info');
      setActivityLog(newLog);
      toast.success('Foto actualizada');
    };
    reader.readAsDataURL(file);
  };

  const toggle2FA = async (val) => {
    setTwoFA(val);
    await setStorageData('solno_2fa_enabled', val);
    
    // Also save to user
    const users = await getStorageData('solno_users', []);
    if (currentUser) {
       const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, twoFA: val } : u);
       await setStorageData('solno_users', updatedUsers);
    }

    const newLog = await logActivity(val ? 'Autenticación 2FA activada' : '2FA desactivada', val ? 'success' : 'warning');
    setActivityLog(newLog);
  };

  const displayData = editing ? draft : profile;
  const initials = (profile.displayName || currentUser?.username || 'A').slice(0, 2).toUpperCase();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-brand" /> Mi Perfil
          </h1>
          <p className="text-gray-400 mt-2">Administra tu información, seguridad y actividad de cuenta.</p>
        </div>
        {!editing ? (
          <Button onClick={startEdit} className="bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold shrink-0">
            <Edit3 className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Editar Perfil</span>
          </Button>
        ) : (
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            <Button onClick={cancelEdit} variant="ghost" className="border border-white/10 text-gray-400 hover:text-white px-3 sm:px-4">Cancelar</Button>
            <Button onClick={saveProfile} className="bg-brand text-black font-bold hover:shadow-glow px-3 sm:px-4"><Save className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Guardar</span></Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* ── Identity Card ── */}
        <Card className="glass border-white/5 md:col-span-1 h-fit">
          <div className="h-1 w-full bg-gradient-to-r from-brand to-[#8ca800]" />
          <CardContent className="pt-8 flex flex-col items-center text-center pb-8">
            {/* Avatar */}
            <div className="relative group mb-5">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-brand to-[#8ca800] flex items-center justify-center shadow-glow">
                {profile.avatar
                  ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-black font-black text-4xl">{initials}</span>}
              </div>
              {/* Scan line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-white/40 animate-[scan_2s_linear_infinite] pointer-events-none hidden md:block" />
              {/* Camera overlay */}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </div>

            <h2 className="text-xl font-bold text-white">{profile.displayName || currentUser?.username || 'Usuario'}</h2>
            <p className="text-brand text-sm font-medium mt-1">{currentUser?.role || 'Super Admin'}</p>
            <p className="text-gray-500 text-xs mt-0.5">@{currentUser?.username || 'admin'}</p>

            <div className="w-full mt-6 space-y-3 text-left border-t border-white/5 pt-5">
              {profile.email && <div className="flex items-center text-sm text-gray-400 gap-2"><Mail className="w-4 h-4 text-white/30 shrink-0" />{profile.email}</div>}
              {profile.phone && <div className="flex items-center text-sm text-gray-400 gap-2"><Phone className="w-4 h-4 text-white/30 shrink-0" />{profile.phone}</div>}
              {profile.location && <div className="flex items-center text-sm text-gray-400 gap-2"><MapPin className="w-4 h-4 text-white/30 shrink-0" />{profile.location}</div>}
              <div className="flex items-center text-sm gap-2">
                <Shield className={`w-4 h-4 shrink-0 ${twoFA ? 'text-brand' : 'text-gray-600'}`} />
                <span className={twoFA ? 'text-brand font-medium' : 'text-gray-600'}>
                  {twoFA ? '2FA Activado' : '2FA Desactivado'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Right column ── */}
        <div className="md:col-span-2 space-y-6">
          {/* General Info */}
          <Card className="glass border-white/5">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white font-bold flex items-center gap-2">
                <Settings className="w-4 h-4 text-brand" /> Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Nombre a Mostrar</label>
                  {editing
                    ? <Input value={draft.displayName} onChange={e => setDraft(d => ({ ...d, displayName: e.target.value }))} className={FIELD} placeholder="Tu nombre" />
                    : <p className="text-sm text-white bg-black/40 border border-white/5 rounded-md px-3 py-2">{profile.displayName || '—'}</p>}
                </div>
                <div>
                  <label className={LABEL}>Correo Electrónico</label>
                  {editing
                    ? <Input type="email" value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} className={FIELD} placeholder="correo@empresa.com" />
                    : <p className="text-sm text-white bg-black/40 border border-white/5 rounded-md px-3 py-2">{profile.email || '—'}</p>}
                </div>
                <div>
                  <label className={LABEL}>Teléfono</label>
                  {editing
                    ? <Input value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} className={FIELD} placeholder="+52 55 0000 0000" />
                    : <p className="text-sm text-white bg-black/40 border border-white/5 rounded-md px-3 py-2">{profile.phone || '—'}</p>}
                </div>
                <div>
                  <label className={LABEL}>Ubicación</label>
                  {editing
                    ? <Input value={draft.location} onChange={e => setDraft(d => ({ ...d, location: e.target.value }))} className={FIELD} placeholder="Ciudad, País" />
                    : <p className="text-sm text-white bg-black/40 border border-white/5 rounded-md px-3 py-2">{profile.location || '—'}</p>}
                </div>
              </div>
              <div>
                <label className={LABEL}>Biografía / Notas</label>
                {editing
                  ? <textarea value={draft.bio} onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))}
                    className="flex w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-brand resize-none"
                    rows={3} placeholder="Algo sobre ti..." />
                  : <p className="text-sm text-gray-400 bg-black/40 border border-white/5 rounded-md px-3 py-2 min-h-[60px]">{profile.bio || '—'}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="glass border-white/5">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white font-bold flex items-center gap-2">
                <Key className="w-4 h-4 text-brand" /> Seguridad de la Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Password row */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-center gap-3">
                  <Lock className="w-8 h-8 p-1.5 bg-white/5 rounded-lg text-white/50" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Contraseña de Acceso</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Actualiza tu clave de forma segura.</p>
                  </div>
                </div>
                <Button onClick={() => setShowPass(true)} variant="outline" className="border-white/10 text-white hover:bg-white/5 text-sm">
                  Cambiar
                </Button>
              </div>

              {/* 2FA row */}
              <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${twoFA ? 'bg-brand/5 border-brand/20' : 'bg-black/40 border-white/5'}`}>
                <div className="flex items-center gap-3">
                  <Smartphone className={`w-8 h-8 p-1.5 rounded-lg ${twoFA ? 'bg-brand/10 text-brand' : 'bg-white/5 text-white/50'}`} />
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      Autenticación de Dos Factores (2FA)
                      {twoFA && <CheckCircle2 className="w-4 h-4 text-brand" />}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {twoFA ? 'Tu cuenta tiene una capa extra de protección.' : 'Añade una capa extra de seguridad a tu cuenta.'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShow2FA(true)}
                  className={twoFA
                    ? 'border border-danger/50 text-danger bg-transparent hover:bg-danger hover:text-white text-sm'
                    : 'bg-brand text-black font-bold hover:shadow-glow text-sm'}>
                  {twoFA ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card className="glass border-white/5">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white font-bold flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-400" /> Registro de Actividad
                </CardTitle>
                <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-full text-gray-400">
                  {activityLog.length} eventos
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {activityLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                  <History className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm">Sin actividad registrada</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {activityLog.slice(0, 10).map(log => (
                    <div key={log.id} className="flex items-center justify-between px-6 py-3 hover:bg-white/2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          log.type === 'success' ? 'bg-brand' :
                          log.type === 'danger'  ? 'bg-danger' :
                          log.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                        }`} />
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${TYPE_COLORS[log.type] || 'text-white'}`}>{log.action}</p>
                          <p className="text-xs text-gray-600 mt-0.5">IP: {log.ip}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 shrink-0 ml-4">{formatTime(log.time)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {show2FA && <TwoFAModal enabled={twoFA} onClose={() => setShow2FA(false)} onToggle={toggle2FA} />}
        {showPassModal && <ChangePasswordModal onClose={() => setShowPass(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
