
import React, { useState } from 'react';
import { Subject, Evaluation, Task } from '../types';
import { Plus, Trash2, CheckCircle, Circle, ArrowLeft } from 'lucide-react';

interface SubjectDetailProps {
  subject: Subject;
  onUpdate: (updatedSubject: Subject) => void;
  onBack: () => void;
}

const SubjectDetail: React.FC<SubjectDetailProps> = ({ subject, onUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState<'evals' | 'tasks'>('evals');
  
  // Evaluation States
  const [evaluations, setEvaluations] = useState<Evaluation[]>(subject.evaluations);
  const [newName, setNewName] = useState('');
  const [newPerc, setNewPerc] = useState(0);
  const [newDate, setNewDate] = useState('');

  // Task States
  const [tasks, setTasks] = useState<Task[]>(subject.tasks || []);
  const [taskName, setTaskName] = useState('');
  const [taskDate, setTaskDate] = useState('');

  const handleAddEvaluation = () => {
    if (!newName || newPerc <= 0) return;
    const newEv: Evaluation = {
      id: crypto.randomUUID(),
      name: newName,
      percentage: newPerc,
      date: newDate || new Date().toISOString().split('T')[0]
    };
    const updated = [...evaluations, newEv];
    setEvaluations(updated);
    onUpdate({ ...subject, evaluations: updated });
    setNewName('');
    setNewPerc(0);
  };

  const handleAddTask = () => {
    if (!taskName) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      name: taskName,
      dueDate: taskDate || new Date().toISOString().split('T')[0],
      completed: false
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    onUpdate({ ...subject, tasks: updated });
    setTaskName('');
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    onUpdate({ ...subject, tasks: updated });
  };

  const handleGradeChange = (id: string, val: string) => {
    const grade = val === '' ? undefined : parseFloat(val);
    if (grade !== undefined && (grade < 0 || grade > 20)) return;
    const updated = evaluations.map(e => e.id === id ? { ...e, grade } : e);
    setEvaluations(updated);
    onUpdate({ ...subject, evaluations: updated });
  };

  const totalPercentage = evaluations.reduce((sum, e) => sum + e.percentage, 0);
  const totalPoints = evaluations.reduce((sum, e) => sum + (e.grade !== undefined ? (e.grade * e.percentage) / 100 : 0), 0);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex flex-col gap-2">
        <button onClick={onBack} className="flex items-center gap-2 text-blue-600 font-bold text-sm">
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">{subject.name}</h2>
          <p className="text-slate-500 text-sm">Prof. {subject.teacher}</p>
        </div>
      </div>

      {/* Vertical Tabs */}
      <div className="flex bg-slate-200 p-1 rounded-2xl">
        <button 
          onClick={() => setActiveTab('evals')}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'evals' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600'}`}
        >
          Evaluaciones
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'tasks' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600'}`}
        >
          Tareas (Sin nota)
        </button>
      </div>

      {activeTab === 'evals' ? (
        <div className="space-y-6">
          {/* Table Container - Horizontal scroll for small screens but better cards */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-blue-900 text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3">Eval.</th>
                  <th className="p-3 text-center">%</th>
                  <th className="p-3 text-center">Nota (20)</th>
                  <th className="p-3 text-center">Pts</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {evaluations.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-800 italic">{ev.name}</td>
                    <td className="p-3 text-center">{ev.percentage}%</td>
                    <td className="p-3">
                      <input 
                        type="number" step="0.1"
                        value={ev.grade ?? ''}
                        onChange={(e) => handleGradeChange(ev.id, e.target.value)}
                        className="w-full text-center border rounded-lg p-1 font-bold text-blue-700"
                        placeholder="-"
                      />
                    </td>
                    <td className="p-3 text-center font-bold">
                      {(ev.grade !== undefined ? (ev.grade * ev.percentage) / 100 : 0).toFixed(2)}
                    </td>
                    <td className="p-3">
                      <button onClick={() => {
                        const updated = evaluations.filter(e => e.id !== ev.id);
                        setEvaluations(updated);
                        onUpdate({...subject, evaluations: updated});
                      }} className="text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50 font-black">
                  <td className="p-3">PROMEDIO FINAL</td>
                  <td className="p-3 text-center">{totalPercentage}%</td>
                  <td className="p-3"></td>
                  <td className="p-3 text-center text-blue-900 text-lg">{totalPoints.toFixed(2)}</td>
                  <td className="p-3"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800">Nueva Evaluación</h3>
            <div className="grid grid-cols-1 gap-3">
              <input type="text" placeholder="Ej: Proyecto Final" value={newName} onChange={e => setNewName(e.target.value)} className="w-full border rounded-xl p-3 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="%" value={newPerc || ''} onChange={e => setNewPerc(parseInt(e.target.value))} className="border rounded-xl p-3 text-sm" />
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="border rounded-xl p-3 text-sm" />
              </div>
              <button onClick={handleAddEvaluation} className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                <Plus size={18} /> Añadir Evaluación
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800">Nueva Tarea</h3>
            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Ej: Leer guía Cap. 2" value={taskName} onChange={e => setTaskName(e.target.value)} className="w-full border rounded-xl p-3 text-sm" />
              <input type="date" value={taskDate} onChange={e => setTaskDate(e.target.value)} className="w-full border rounded-xl p-3 text-sm" />
              <button onClick={handleAddTask} className="w-full bg-red-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                <Plus size={18} /> Añadir Tarea
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
            {tasks.length > 0 ? tasks.map(t => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleTask(t.id)} className={t.completed ? 'text-green-500' : 'text-slate-300'}>
                    {t.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                  </button>
                  <div className={t.completed ? 'line-through text-slate-400' : ''}>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold">{new Date(t.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => {
                  const updated = tasks.filter(x => x.id !== t.id);
                  setTasks(updated);
                  onUpdate({...subject, tasks: updated});
                }} className="text-red-400 p-2"><Trash2 size={16}/></button>
              </div>
            )) : (
              <p className="text-center py-10 text-slate-400 italic text-sm">No hay tareas. ¡Disfruta el descanso!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectDetail;
