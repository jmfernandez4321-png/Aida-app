
import React from 'react';
import { Subject, User, Evaluation } from '../types';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { AlertCircle, TrendingDown, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  subjects: Subject[];
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ subjects, user }) => {
  const calculateSubjectGrade = (subject: Subject) => {
    let total = 0;
    let gradedCount = 0;
    subject.evaluations.forEach(ev => {
      if (ev.grade !== undefined) {
        total += (ev.grade * ev.percentage) / 100;
        gradedCount++;
      }
    });
    return { total, gradedCount };
  };

  // Improved Logic: Only subjects with graded evaluations
  const subjectsWithGrades = subjects.filter(s => calculateSubjectGrade(s).gradedCount > 0);
  const lowGradeSubjects = subjectsWithGrades.filter(s => calculateSubjectGrade(s).total < 10);
  
  // Escalating alerts:
  // 0 low grades -> None
  // 1-2 low grades -> Moderate (Yellow/Orange)
  // 3+ low grades -> Critical (Red)
  const alertLevel = lowGradeSubjects.length >= 3 ? 'critical' : lowGradeSubjects.length > 0 ? 'warning' : 'none';

  const chartData = subjects.map(s => ({
    name: s.name,
    nota: calculateSubjectGrade(s).total
  }));

  const pendingEvaluations = subjects.flatMap(s => s.evaluations.filter(e => !e.grade));
  const pendingTasks = subjects.flatMap(s => s.tasks.filter(t => !t.completed));

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <header className="px-1">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">¡Hola, {user.firstName}!</h1>
        <p className="text-slate-500 text-sm">Tu resumen académico vertical.</p>
      </header>

      {/* Vertical Stats Cards - Stacked on Mobile */}
      <div className="grid grid-cols-1 gap-4">
        {/* Alerts Section */}
        {alertLevel !== 'none' && (
          <div className={`p-4 rounded-2xl shadow-sm border-l-8 flex items-start gap-3 ${
            alertLevel === 'critical' ? 'bg-red-50 border-red-600' : 'bg-orange-50 border-orange-500'
          }`}>
            {alertLevel === 'critical' ? <AlertCircle className="text-red-600 flex-shrink-0" /> : <AlertTriangle className="text-orange-500 flex-shrink-0" />}
            <div>
              <h3 className={`font-bold ${alertLevel === 'critical' ? 'text-red-800' : 'text-orange-800'}`}>
                {alertLevel === 'critical' ? '¡S.O.S! Riesgo de Reprobación' : '¡Atención! Notas bajas detectadas'}
              </h3>
              <p className={`text-sm ${alertLevel === 'critical' ? 'text-red-700' : 'text-orange-700'}`}>
                Tus promedios en {lowGradeSubjects.map(s => s.name).join(', ')} están por debajo de 10. 
                {alertLevel === 'critical' ? ' ¡Necesitas un plan de estudio urgente!' : ' Te recomendamos reforzar estas áreas.'}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600"><BookOpenIcon size={20} /></div>
            <p className="text-slate-600 font-medium">Materias</p>
          </div>
          <p className="text-xl font-bold">{subjects.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2.5 rounded-xl text-red-600"><Clock size={20} /></div>
            <p className="text-slate-600 font-medium">Eval. Pendientes</p>
          </div>
          <p className="text-xl font-bold">{pendingEvaluations.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2.5 rounded-xl text-green-600"><CheckCircle size={20} /></div>
            <p className="text-slate-600 font-medium">Promedio</p>
          </div>
          <p className="text-xl font-bold">
            {(subjectsWithGrades.reduce((acc, s) => acc + calculateSubjectGrade(s).total, 0) / (subjectsWithGrades.length || 1)).toFixed(1)}
          </p>
        </div>
      </div>

      {/* Performance Graph - Optimized for vertical screen */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-md font-bold mb-4 flex items-center gap-2">
          <TrendingDown size={18} className="text-blue-600" /> Rendimiento
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 20]} fontSize={10} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="nota" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.nota < 10 && entry.nota > 0 ? '#E11D48' : '#1E40AF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tasks & Upcoming - Vertical lists */}
      <div className="space-y-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold mb-3 flex justify-between items-center text-sm">
            <span>Tareas Pendientes</span>
            <span className="text-blue-600 text-xs">{pendingTasks.length}</span>
          </h3>
          <div className="space-y-2">
            {pendingTasks.slice(0, 3).map(t => (
              <div key={t.id} className="p-3 bg-slate-50 rounded-xl text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="flex-1 truncate">{t.name}</span>
                <span className="text-[10px] text-slate-400 font-bold">{new Date(t.dueDate).toLocaleDateString()}</span>
              </div>
            ))}
            {pendingTasks.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Sin tareas pendientes</p>}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold mb-3 text-sm">Próximas Evaluaciones</h3>
          <div className="space-y-3">
            {pendingEvaluations.length > 0 ? (
              pendingEvaluations.slice(0, 4).map(ev => (
                <div key={ev.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{ev.name}</p>
                    <p className="text-[10px] text-slate-500">{new Date(ev.date).toLocaleDateString()}</p>
                  </div>
                  <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                    {ev.percentage}%
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-4 text-xs">¡Todo al día!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BookOpenIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);

export default Dashboard;
