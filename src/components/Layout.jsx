import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users,
  UserCircle,
  FileText,
  CreditCard,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  LayoutTemplate,
  ShieldCheck,
  ChevronDown,
  FolderGit2,
  Ticket,
  ClipboardList
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Usuarios', href: '/usuarios', icon: UserCircle },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Cotizaciones', href: '/cotizaciones', icon: FileText },
  { name: 'Propuestas', href: '/propuestas', icon: ClipboardList },
  { name: 'Gastos', href: '/gastos', icon: CreditCard },
  { name: 'Proveedores', href: '/proveedores', icon: Briefcase },
  { name: 'Proyectos', href: '/proyectos', icon: FolderGit2 },
  { name: 'Tickets', href: '/tickets', icon: Ticket },
  { name: 'Recursos Humanos', href: '/rh', icon: Users },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    displayName: 'Administrador',
    email: 'admin@solno.mx',
    avatar: null
  });
  const profileMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = () => {
      const cu = JSON.parse(localStorage.getItem('solno_current_user') || 'null');
      if (cu) {
        setCurrentUser({
          displayName: cu.displayName || cu.username || 'Administrador',
          email: cu.email || 'admin@solno.mx',
          avatar: cu.avatar || null
        });
      }
    };
    loadUser();
    
    window.addEventListener('solno_data_updated', loadUser);
    return () => window.removeEventListener('solno_data_updated', loadUser);
  }, []);

  useEffect(() => {
    // Check if we need to show the welcome toast
    const shouldShowWelcome = sessionStorage.getItem('solno_show_welcome');
    if (shouldShowWelcome === 'true') {
      // Remove the flag so it doesn't show again on reload
      sessionStorage.removeItem('solno_show_welcome');
      
      // Delay slightly for effect
      setTimeout(() => {
        toast('Autenticación Exitosa', {
          description: 'Bienvenido de vuelta al panel de gestión, Administrador.',
          icon: <ShieldCheck className="w-5 h-5 text-brand" />,
        });
      }, 500);
    }
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('solno_auth');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background font-sans text-foreground">
      {/* Background ambient glow - Hidden on mobile to prevent glitches/performance issues */}
      <div className="fixed inset-0 pointer-events-none z-0 hidden md:block">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-brand/5 blur-[100px]" />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 glass border-r border-white/5 flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.8)] lg:static lg:translate-x-0 transition-all duration-300", 
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-center h-32 px-6 border-b border-white/5 relative overflow-hidden group">
          {/* Subtle neon accent line */}
          <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-brand/40 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="flex items-center justify-center relative z-10 w-full h-full py-2">
            <img src="/logo2.png" alt="Solno Logo" className="h-full w-auto object-contain max-h-[100px]" />
          </div>
          <button className="lg:hidden text-mutedForeground hover:text-white absolute right-4 top-8" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto relative z-10">
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + (index * 0.05) }}
              >
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-3.5 text-sm font-medium transition-all group rounded-xl relative overflow-hidden",
                    isActive 
                      ? "text-brand bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" 
                      : "text-mutedForeground hover:bg-white/5 hover:text-white"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute left-0 top-0 h-full w-[2px] bg-brand shadow-[0_0_10px_#ccff00]" 
                    />
                  )}
                  <item.icon className={cn(
                    "flex-shrink-0 w-5 h-5 mr-3 transition-all duration-300", 
                    isActive ? "text-brand drop-shadow-[0_0_8px_rgba(204,255,0,0.8)] scale-110" : "text-mutedForeground group-hover:text-white group-hover:scale-110"
                  )} />
                  <span className="tracking-wide whitespace-nowrap">{item.name}</span>
                </Link>
              </motion.div>
            )
          })}
        </nav>
      </motion.div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden relative z-10">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between h-20 px-4 glass border-b border-white/5 lg:px-8 z-30"
        >
          <button className="lg:hidden text-white hover:bg-white/10 p-2 rounded-xl transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center justify-end w-full">
            <div className="flex items-center space-x-4 relative" ref={profileMenuRef}>
              <div className="flex flex-col items-end mr-3 hidden sm:flex">
                <span className="text-sm font-semibold text-white tracking-wide">{currentUser.displayName}</span>
                <span className="text-xs text-brand font-medium">{currentUser.email}</span>
              </div>
              
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 outline-none"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand to-[#8ca800] flex items-center justify-center text-black font-bold shadow-glow cursor-pointer hover:shadow-glow-strong transition-all hover:scale-105 border border-brand/50 overflow-hidden">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    (currentUser.displayName || 'A').slice(0, 2).toUpperCase()
                  )}
                </div>
                <ChevronDown className={cn("w-4 h-4 text-mutedForeground transition-transform duration-200", profileMenuOpen && "rotate-180")} />
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-14 right-0 w-56 glass rounded-xl border border-white/10 shadow-corporate overflow-hidden py-2"
                  >
                    <div className="py-1">
                      <Link to="/perfil" onClick={() => setProfileMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-mutedForeground hover:text-white hover:bg-white/5 transition-colors">
                        <UserCircle className="w-4 h-4 mr-3" /> Mi Perfil
                      </Link>
                      <Link to="/configuracion" onClick={() => setProfileMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-mutedForeground hover:text-white hover:bg-white/5 transition-colors">
                        <Settings className="w-4 h-4 mr-3" /> Configuración
                      </Link>
                    </div>
                    
                    <div className="border-t border-white/5 mt-1 pt-1">
                      <button 
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }} 
                        className="flex items-center w-full px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" /> Cerrar sesión
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative z-20">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-7xl"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
