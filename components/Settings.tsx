
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Moon, Sun, Share2, Download, LogOut, UserMinus, Camera, X } from 'lucide-react';
import { Subject } from '../types';
import { logout as storageLogout } from '../utils/storage';
import { useNavigate } from 'react-router-dom';

interface SettingsProps {
  subjects: Subject[];
  onImport: (newSubjects: Subject[]) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ subjects, onImport, onLogout }) => {
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [showQR, setShowQR] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aida_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aida_theme', 'light');
    }
  };

  const generateDataPayload = () => {
    // We only share the metadata and evaluations/tasks, not sensitive user info
    const payload = subjects.map(s => ({
      name: s.name,
      teacher: s.teacher,
      evaluations: s.evaluations,
      tasks: s.tasks
    }));
    return JSON.stringify(payload);
  };

  const startScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render((decodedText) => {
        try {
          const importedData = JSON.parse(decodedText);
          if (Array.isArray(importedData)) {
            onImport(importedData);
            alert("¡Materias y Evaluaciones importadas con éxito!");
            scanner.clear();
            setIsScanning(false);
          }
        } catch (e) {
          alert("Código QR inválido o dañado.");
        }
      }, (error) => {});
    }, 100);
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="px-1 flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Configuración</h2>
      </header>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
        {/* Appearance */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
              {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-blue-600" />}
            </div>
            <div>
              <p className="font-bold text-sm">Modo Oscuro</p>
              <p className="text-[10px] text-slate-400">Reduce la fatiga visual</p>
            </div>
          </div>
          <button 
            onClick={toggleDarkMode}
            className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        {/* Sync / Transfer */}
        <div className="p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Sincronización de Datos</p>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setShowQR(true)}
              className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 gap-2 active:scale-95 transition-all"
            >
              <Share2 size={24} className="text-blue-600" />
              <span className="text-[11px] font-black text-blue-900 dark:text-blue-400">ENVIAR</span>
            </button>
            <button 
              onClick={startScanner}
              className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30 gap-2 active:scale-95 transition-all"
            >
              <Download size={24} className="text-red-600" />
              <span className="text-[11px] font-black text-red-900 dark:text-red-400">RECIBIR</span>
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="p-5 space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Cuenta</p>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-slate-400" />
              <span className="text-sm font-bold">Cerrar Sesión</span>
            </div>
          </button>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center relative">
            <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 p-2"><X size={24}/></button>
            <h3 className="text-xl font-black mb-2">Compartir Materias</h3>
            <p className="text-xs text-slate-500 mb-6">Muestra este código a tu compañero para que escanee tus evaluaciones.</p>
            <div className="bg-white p-4 inline-block rounded-2xl shadow-inner border">
              <QRCodeSVG value={generateDataPayload()} size={200} />
            </div>
            <p className="mt-6 text-[10px] font-bold text-blue-600 uppercase">Colegio Los Próceres - AIDA Sync</p>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-black">Escaneando...</h3>
            <button onClick={() => { setIsScanning(false); }} className="text-white p-2"><X size={28}/></button>
          </div>
          <div id="reader" className="w-full rounded-2xl overflow-hidden border-2 border-red-600"></div>
          <p className="text-center text-slate-400 text-xs mt-6 px-10">Apunta la cámara al código QR de AIDA en el otro dispositivo.</p>
        </div>
      )}

      <div className="text-center pt-4">
        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">AIDA v2.1 • Asistente Inteligente de Agenda</p>
      </div>
    </div>
  );
};

export default Settings;
