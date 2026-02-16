
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, Subject, AcademicYear } from './types';
import { getUser, getSubjects, saveUser, saveSubjects, logout } from './utils/storage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SubjectDetail from './components/SubjectDetail';
import Chatbot from './components/Chatbot';
import Settings from './components/Settings';
import { Calendar as CalendarIcon, Bell, CheckCircle2, UserPlus, LogIn } from 'lucide-react';
import { VENEZUELA_HOLIDAYS } from './constants';

const AuthScreen: React.FC<{ onAuth: (user: User) => void }> = ({ onAuth }) => {
  const [isRegister, setIsRegister] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    year: AcademicYear.FIRST,
    section: 'A',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      onAuth(formData);
    }
  };

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="inline-block bg-red-600 text-white p-4 rounded-3xl mb-4 shadow-xl">
            <span className="text-4xl font-black italic tracking-tighter">AIDA</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Colegio Los Próceres</h1>
          <p className="text-slate-400 text-xs font-bold mt-1 tracking-widest uppercase">Inteligencia Académica</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
          <button 
            onClick={() => setIsRegister(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${isRegister ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500'}`}
          >
            <UserPlus size={14} /> Registro
          </button>
          <button 
            onClick={() => setIsRegister(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${!isRegister ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500'}`}
          >
            <LogIn size={14} /> Ingreso
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <input required type="text" placeholder="Nombre" className="w-full border-none rounded-2xl px-5 py-4 text-sm outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 shadow-sm" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              <input required type="text" placeholder="Apellido" className="w-full border-none rounded-2xl px-5 py-4 text-sm outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 shadow-sm" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
          )}
          <input required type="email" placeholder="Email Institucional" className="w-full border-none rounded-2xl px-5 py-4 text-sm outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 shadow-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input required type="password" placeholder="Contraseña" className="w-full border-none rounded-2xl px-5 py-4 text-sm outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 shadow-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          
          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <select className="w-full border-none rounded-2xl px-5 py-4 text-sm bg-slate-50 outline-none shadow-sm" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value as AcademicYear})}>
                {Object.values(AcademicYear).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <input required type="text" maxLength={1} placeholder="Secc" className="w-full border-none rounded-2xl px-5 py-4 text-sm outline-none bg-slate-50 uppercase text-center shadow-sm" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value.toUpperCase()})} />
            </div>
          )}
          
          <button type="submit" className="w-full bg-red-600 text-white font-black py-5 rounded-[1.5rem] hover:bg-red-700 active:scale-[0.98] transition-all shadow-2xl mt-4 uppercase tracking-widest text-sm">
            {isRegister ? 'Crear Cuenta AIDA' : 'Iniciar Sesión'}
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-8 leading-relaxed font-medium">
          Tus datos se guardan de forma segura para sincronizar en múltiples dispositivos.
        </p>
      </div>
    </div>
  );
};

const CalendarViewComponent: React.FC<{ subjects: Subject[] }> = ({ subjects }) => {
  const allEvents = [
    ...subjects.flatMap(s => s.evaluations.map(e => ({ ...e, type: 'eval', subject: s.name }))),
    ...subjects.flatMap(s => (s.tasks || []).map(t => ({ id: t.id, name: t.name, date: t.dueDate, type: 'task', subject: s.name, completed: t.completed }))),
    ...VENEZUELA_HOLIDAYS.map(h => ({ name: h.name, date: h.date, type: 'holiday', subject: 'PAÍS' }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = allEvents.filter(e => e.date >= today);

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Agenda & Calendario</h2>
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 p-2 rounded-xl"><CalendarIcon size={20} /></div>
      </header>

      <div className="space-y-3">
        {upcomingEvents.map((e, i) => (
          <div key={i} className={`p-5 rounded-3xl border animate-in slide-in-from-bottom duration-500 delay-${i % 5} ${
            e.type === 'holiday' ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20' : 
            e.type === 'eval' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
          }`}>
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shadow-sm ${
                e.type === 'holiday' ? 'bg-red-600 text-white' : 
                e.type === 'eval' ? 'bg-blue-900 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                <span className="text-[10px] font-bold uppercase">{new Date(e.date).toLocaleString('es', { month: 'short' })}</span>
                <span className="text-lg font-black leading-none">{new Date(e.date).getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-black text-sm truncate ${e.type === 'task' && (e as any).completed ? 'line-through opacity-50' : 'text-slate-800 dark:text-white'}`}>{e.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{e.subject} • {e.type === 'holiday' ? 'FERIADO' : e.type === 'eval' ? 'EVALUACIÓN' : 'TAREA'}</p>
              </div>
            </div>
          </div>
        ))}
        {upcomingEvents.length === 0 && <p className="text-center py-20 text-slate-400 font-bold text-sm">No tienes pendientes cercanos.</p>}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(getUser());
  const [subjects, setSubjects] = useState<Subject[]>(getSubjects());
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Check theme
    const savedTheme = localStorage.getItem('aida_theme');
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');
  }, []);

  const handleAuth = (u: User) => {
    setUser(u);
    saveUser(u);
  };

  const addSubject = (name: string, teacher: string) => {
    if (!name) return;
    const newSub: Subject = {
      id: crypto.randomUUID(),
      name,
      teacher,
      evaluations: [],
      tasks: []
    };
    const updated = [...subjects, newSub];
    setSubjects(updated);
    saveSubjects(updated);
  };

  const updateSubject = (updated: Subject) => {
    const newSubjects = subjects.map(s => s.id === updated.id ? updated : s);
    setSubjects(newSubjects);
    saveSubjects(newSubjects);
    setSelectedSubject(updated);
  };

  const handleImportData = (imported: Subject[]) => {
    // Merge strategy: Keep existing but add new ones from colleague
    // Or just replace if requested. For ease, we replace to sync exactly.
    const newSubjects = imported.map(s => ({
      ...s,
      id: crypto.randomUUID(), // New local IDs
      evaluations: s.evaluations.map(e => ({ ...e, id: crypto.randomUUID(), grade: undefined })), // Clear grades
      tasks: (s.tasks || []).map(t => ({ ...t, id: crypto.randomUUID(), completed: false })) // Clear completion
    }));
    setSubjects(newSubjects);
    saveSubjects(newSubjects);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setSubjects([]);
  };

  if (!user) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  return (
    <HashRouter>
      <Layout userName={`${user.firstName} ${user.lastName}`}>
        <div className="relative">
          {/* Simulated Notification Bell */}
          <div className="absolute -top-12 right-0 md:hidden">
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-slate-400 relative">
              <Bell size={24} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-slate-50"></span>
            </button>
          </div>
          
          {showNotifications && (
            <div className="absolute top-0 right-0 left-0 z-[60] p-5 bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-2xl rounded-3xl animate-in slide-in-from-top duration-300">
               <h4 className="font-black text-red-600 mb-3 uppercase text-xs flex items-center justify-between">
                 Recordatorios AIDA
                 <button onClick={() => setShowNotifications(false)} className="text-slate-400">X</button>
               </h4>
               <ul className="text-xs space-y-3">
                 <li className="flex gap-3 items-start"><CheckCircle2 size={14} className="text-green-500 flex-shrink-0" /> <span className="text-slate-600 dark:text-slate-300">¡Sincronización activa! Tus datos están en la nube.</span></li>
                 <li className="flex gap-3 items-start"><CheckCircle2 size={14} className="text-blue-500 flex-shrink-0" /> <span className="text-slate-600 dark:text-slate-300">Revisa tu agenda los domingos para preparar tu semana.</span></li>
               </ul>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard subjects={subjects} user={user} />} />
            <Route 
              path="/subjects" 
              element={
                selectedSubject ? (
                  <SubjectDetail 
                    subject={selectedSubject} 
                    onUpdate={updateSubject} 
                    onBack={() => setSelectedSubject(null)} 
                  />
                ) : (
                  <div className="space-y-6 pb-20">
                    <header className="px-1"><h2 className="text-xl font-black text-slate-900 dark:text-white">Mis Materias</h2></header>
                    <div className="grid grid-cols-1 gap-4">
                      {subjects.map(s => (
                        <div key={s.id} onClick={() => setSelectedSubject(s)} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 flex items-center justify-between group active:scale-95 transition-all shadow-sm">
                          <div className="flex items-center gap-5">
                            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-400 p-4 rounded-2xl shadow-inner"><BookIcon size={24} /></div>
                            <div className="min-w-0">
                              <h3 className="font-black text-slate-800 dark:text-white truncate text-lg">{s.name}</h3>
                              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">{s.teacher}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-xl text-slate-500">{s.evaluations.length} Evals</span>
                        </div>
                      ))}
                      <div className="bg-slate-50 dark:bg-slate-900/50 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 text-center">
                         <h4 className="font-black text-xs text-slate-400 mb-4 uppercase tracking-widest">Añadir Nueva Materia</h4>
                         <div className="space-y-3">
                           <input id="sub-name" placeholder="Ej: Física" className="w-full text-sm p-4 rounded-2xl border-none outline-none shadow-inner dark:bg-slate-800" />
                           <input id="sub-teacher" placeholder="Nombre del Profesor" className="w-full text-sm p-4 rounded-2xl border-none outline-none shadow-inner dark:bg-slate-800" />
                           <button onClick={() => {
                             const n = (document.getElementById('sub-name') as HTMLInputElement).value;
                             const t = (document.getElementById('sub-teacher') as HTMLInputElement).value;
                             addSubject(n, t);
                             (document.getElementById('sub-name') as HTMLInputElement).value = '';
                             (document.getElementById('sub-teacher') as HTMLInputElement).value = '';
                           }} className="w-full bg-blue-900 text-white font-black py-4 rounded-2xl text-sm shadow-xl active:scale-95 transition-all">Registrar</button>
                         </div>
                      </div>
                    </div>
                  </div>
                )
              } 
            />
            <Route path="/calendar" element={<CalendarViewComponent subjects={subjects} />} />
            <Route path="/chat" element={<Chatbot user={user} />} />
            <Route path="/settings" element={<Settings subjects={subjects} onImport={handleImportData} onLogout={handleLogout} />} />
          </Routes>
        </div>
      </Layout>
    </HashRouter>
  );
};

const BookIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
);

export default App;
