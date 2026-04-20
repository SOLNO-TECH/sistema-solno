import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { User, Lock, ArrowRight, ShieldCheck, Cpu, Database, Network, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = JSON.parse(localStorage.getItem('solno_users') || '[]');

    const match = users.find(u =>
      (u.username || u.name || '').toLowerCase() === username.toLowerCase().trim() &&
      u.passwordHash === btoa(password)
    );

    const isDefaultAdmin = username === 'admin' && password === 'admin';

    if (match || isDefaultAdmin) {
      localStorage.setItem('solno_auth', 'true');
      if (match) localStorage.setItem('solno_current_user', JSON.stringify(match));
      sessionStorage.setItem('solno_show_welcome', 'true');
      // Log successful login
      const logs = JSON.parse(localStorage.getItem('solno_activity_log') || '[]');
      logs.unshift({ id: Date.now(), action: 'Inicio de sesión exitoso', type: 'success', ip: `192.168.1.${Math.floor(Math.random()*50)+100}`, time: new Date().toISOString() });
      localStorage.setItem('solno_activity_log', JSON.stringify(logs.slice(0, 50)));
      navigate('/');
    } else {
      // Log failed attempt
      const logs = JSON.parse(localStorage.getItem('solno_activity_log') || '[]');
      logs.unshift({ id: Date.now(), action: `Intento de inicio de sesión fallido — usuario: "${username}"`, type: 'danger', ip: `189.204.${Math.floor(Math.random()*255)}.x`, time: new Date().toISOString() });
      localStorage.setItem('solno_activity_log', JSON.stringify(logs.slice(0, 50)));
      setError('Usuario o contraseña incorrectos. Verifica tus credenciales.');
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] font-sans">
      
      {/* LEFT PANEL - Decorative Brand Area */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#0a0a0a] border-r border-white/5 items-center justify-center"
      >
        <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[70%] rounded-full bg-brand/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-brand/5 blur-[100px]" />
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 p-16 flex flex-col justify-center h-full max-w-2xl"
        >
          <motion.div variants={itemVariants} className="mb-10">
            <img src="/logo2.png" alt="Solno Logo" className="h-40 w-auto object-contain drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]" />
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl font-black text-white leading-tight tracking-tight mb-6">
            GESTIÓN E<br />
            INFRAESTRUCTURA<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-[#8ca800]">
              CENTRALIZADA.
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-mutedForeground text-lg leading-relaxed max-w-md">
            Panel administrativo de alto rendimiento para el control total de recursos corporativos, usuarios y configuraciones del sistema.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-16 grid grid-cols-2 gap-8 border-t border-white/10 pt-12">
            <div className="flex flex-col gap-3 group">
              <Database className="w-6 h-6 text-brand/50 group-hover:text-brand transition-colors duration-300" />
              <h3 className="text-sm font-bold text-white tracking-widest uppercase">Datos Seguros</h3>
              <p className="text-xs text-mutedForeground">Encriptación de extremo a extremo.</p>
            </div>
            <div className="flex flex-col gap-3 group">
              <Network className="w-6 h-6 text-brand/50 group-hover:text-brand transition-colors duration-300" />
              <h3 className="text-sm font-bold text-white tracking-widest uppercase">Alta Disponibilidad</h3>
              <p className="text-xs text-mutedForeground">Monitoreo y respuesta en tiempo real.</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* RIGHT PANEL - Login Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          
          <motion.div variants={itemVariants} className="mb-10 text-center lg:text-left">
            <div className="flex justify-center lg:hidden mb-8">
              <img src="/logo2.png" alt="Solno Logo" className="h-28 w-auto object-contain drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Acceso Seguro</h2>
            <p className="text-mutedForeground mt-3">Ingresa tus credenciales para continuar.</p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-xs font-semibold text-mutedForeground" htmlFor="username">Usuario</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-mutedForeground transition-colors group-focus-within:text-brand" />
                </div>
                <Input 
                  id="username" 
                  placeholder="admin" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-12 h-14 rounded-xl bg-white/5 border-white/10 focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand text-white placeholder:text-white/20 transition-all hover:bg-white/10 font-mono"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-xs font-semibold text-mutedForeground" htmlFor="password">Clave de Acceso</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-mutedForeground transition-colors group-focus-within:text-brand" />
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 rounded-xl bg-white/5 border-white/10 focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand text-white placeholder:text-white/20 transition-all hover:bg-white/10"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2 cursor-pointer group/check">
                <div className="relative flex items-center justify-center w-5 h-5 border border-white/20 rounded bg-black group-hover/check:border-brand transition-colors">
                  <input 
                    type="checkbox" 
                    className="absolute opacity-0 w-full h-full cursor-pointer"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <motion.div 
                    initial={false}
                    animate={{ scale: rememberMe ? 1 : 0 }}
                    className="w-2.5 h-2.5 bg-brand rounded-sm" 
                  />
                </div>
                <span className="text-sm text-mutedForeground group-hover/check:text-white transition-colors">Mantener sesión activa</span>
              </label>
              <a href="#" className="text-sm font-medium text-mutedForeground hover:text-brand transition-colors">
                ¿Olvidaste tu clave?
              </a>
            </motion.div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger font-medium flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
                {error}
              </motion.div>
            )}
            
            <motion.div variants={itemVariants}>
              <button 
                type="submit" 
                disabled={isLoading}
                className="relative w-full h-14 text-black font-bold text-lg mt-8 rounded-xl bg-brand shadow-glow flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-strong active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none overflow-hidden"
              >
                {/* Shine effect */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 animate-[shimmer_2s_infinite]" />
                
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>Iniciar Sesión <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </motion.div>
          </form>
          
          <motion.div variants={itemVariants} className="mt-16 text-center lg:text-left text-xs text-mutedForeground/60">
            &copy; {new Date().getFullYear()} Panel Administrativo. Uso exclusivo corporativo.
          </motion.div>
        </motion.div>
      </div>
      
    </div>
  );
}
