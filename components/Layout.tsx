
import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar as CalendarIcon, 
  MessageCircle, 
  Settings as SettingsIcon,
  LogOut,
  User as UserIcon,
  Bell
} from 'lucide-react';
import { logout } from '../utils/storage';

interface LayoutProps {
  children: React.ReactNode;
  userName: string;
}

const Layout: React.FC<LayoutProps> = ({ children, userName }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    window.location.reload();
  };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={22} />, label: 'Inicio' },
    { to: '/subjects', icon: <BookOpen size={22} />, label: 'Materias' },
    { to: '/calendar', icon: <CalendarIcon size={22} />, label: 'Agenda' },
    { to: '/chat', icon: <MessageCircle size={22} />, label: 'AIDA' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-blue-900 text-white p-4 sticky top-0 h-screen shadow-2xl">
        <div className="flex items-center gap-3 mb-10 px-2 pt-4">
          <div className="bg-red-600 p-2.5 rounded-xl shadow-lg shadow-red-900/20"><span className="font-black text-xl text-white italic tracking-tighter">AIDA</span></div>
          <div className="leading-tight">
            <h1 className="text-sm font-black uppercase tracking-[0.1em]">Los Próceres</h1>
            <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">Inteligencia</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${
                  isActive ? 'bg-red-600 text-white shadow-xl shadow-red-900/30' : 'text-blue-100 hover:bg-blue-800'
                }`
              }
            >
              {item.icon}
              <span className="font-black uppercase text-[11px] tracking-widest">{item.label}</span>
            </NavLink>
          ))}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${
                isActive ? 'bg-slate-700 text-white shadow-xl' : 'text-blue-100 hover:bg-blue-800'
              }`
            }
          >
            <SettingsIcon size={22} />
            <span className="font-black uppercase text-[11px] tracking-widest">Config</span>
          </NavLink>
        </nav>
        <div className="pt-6 border-t border-blue-800 space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-800/50 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center"><UserIcon size={16} /></div>
            <span className="text-[11px] font-black uppercase tracking-widest truncate">{userName}</span>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <nav className="md:hidden bg-blue-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-xl border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-900/40"><span className="font-black text-xs text-white italic tracking-tighter">AIDA</span></div>
          <span className="font-black text-[10px] uppercase tracking-[0.2em]">Los Próceres</span>
        </div>
        <div className="flex gap-2">
          <NavLink to="/settings" className={`p-2 rounded-xl transition-all ${location.pathname === '/settings' ? 'bg-red-600' : 'bg-blue-800'}`}>
            <SettingsIcon size={20} className="text-white" />
          </NavLink>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full mb-20 md:mb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 h-18 fixed bottom-0 left-0 right-0 flex items-center justify-around z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full transition-all relative ${
                isActive ? 'text-red-600' : 'text-slate-400 dark:text-slate-500'
              }`
            }
          >
            <div className={`p-1.5 transition-all ${location.pathname === item.to ? 'scale-125 -translate-y-1' : ''}`}>
              {item.icon}
            </div>
            <span className={`text-[9px] font-black mt-0.5 uppercase tracking-widest transition-opacity ${location.pathname === item.to ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
            {location.pathname === item.to && <div className="absolute bottom-2 w-1.5 h-1.5 bg-red-600 rounded-full shadow-lg shadow-red-500/50"></div>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
