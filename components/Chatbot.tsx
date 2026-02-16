
import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, Brain, Image as ImageIcon, Loader2, User as UserIcon, Bot, Trash2 } from 'lucide-react';
import { ChatMode, Message, User } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

interface ChatbotProps {
  user: User;
}

const Chatbot: React.FC<ChatbotProps> = ({ user }) => {
  // Separate histories for each mode as requested
  const [messagesByMode, setMessagesByMode] = useState<Record<ChatMode, Message[]>>({
    [ChatMode.FAST]: [
      { role: 'assistant', content: `¡Hola ${user.firstName}! Modo Rápido activo. ¿Qué duda académica tienes?`, timestamp: Date.now() }
    ],
    [ChatMode.THINK]: [
      { role: 'assistant', content: `Modo Pensar activo. Resolveré problemas complejos de ${user.year} año paso a paso.`, timestamp: Date.now() }
    ],
    [ChatMode.IMAGE]: [
      { role: 'assistant', content: `Modo Generación de Imagen activo. Describe qué imagen quieres que cree para tus estudios (usando nanobanana).`, timestamp: Date.now() }
    ],
  });

  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ChatMode>(ChatMode.FAST);
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentMessages = messagesByMode[mode];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [currentMessages, mode]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input, 
      timestamp: Date.now()
    };
    
    // Update only the current mode's history
    setMessagesByMode(prev => ({
      ...prev,
      [mode]: [...prev[mode], userMessage]
    }));
    
    const promptToSend = input;
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessageToGemini(promptToSend, mode, user);
      const botMessage: Message = {
        role: 'assistant',
        content: response.text || "",
        image: response.image,
        thinking: response.thinking,
        timestamp: Date.now()
      };
      
      setMessagesByMode(prev => ({
        ...prev,
        [mode]: [...prev[mode], botMessage]
      }));
    } catch (error) {
      setMessagesByMode(prev => ({
        ...prev,
        [mode]: [...prev[mode], { role: 'assistant', content: 'Lo siento, hubo un error con la conexión de AIDA.', timestamp: Date.now() }]
      }));
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessagesByMode(prev => ({
      ...prev,
      [mode]: [{ role: 'assistant', content: `Chat reiniciado en modo ${mode}.`, timestamp: Date.now() }]
    }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header / Modes */}
      <div className="bg-slate-50 border-b p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 text-white p-2 rounded-lg">
              <Bot size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-900 leading-tight">AIDA AI - {mode}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{user.year} Año • Secc {user.section}</p>
            </div>
          </div>
          <button onClick={clearChat} className="text-slate-400 hover:text-red-600 transition-colors" title="Limpiar Chat">
            <Trash2 size={18} />
          </button>
        </div>

        <div className="flex bg-slate-200 p-1 rounded-xl">
          {[ChatMode.FAST, ChatMode.THINK, ChatMode.IMAGE].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-black uppercase transition-all ${
                mode === m ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              {m === ChatMode.FAST && <Zap size={14} />}
              {m === ChatMode.THINK && <Brain size={14} />}
              {m === ChatMode.IMAGE && <ImageIcon size={14} />}
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/20">
        {currentMessages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                m.role === 'user' ? 'bg-blue-600' : 'bg-red-600'
              } text-white shadow-sm`}>
                {m.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
              </div>
              <div className="space-y-1">
                <div className={`p-4 rounded-2xl ${
                  m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm'
                }`}>
                  {m.image && (
                    <div className="mb-3">
                      <img src={m.image} alt="Generada por AIDA" className="rounded-lg w-full h-auto border shadow-inner bg-slate-100" />
                      <p className="text-[10px] text-center text-slate-400 mt-2 italic">Imagen generada por IA (Nano Banana)</p>
                    </div>
                  )}
                  {m.thinking && (
                    <div className="mb-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-blue-700 italic">
                      <p className="font-bold uppercase mb-1 flex items-center gap-1"><Brain size={12} /> Razonamiento:</p>
                      {m.thinking}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
                <p className="text-[9px] text-slate-400 px-1">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2 items-center text-slate-400">
              <div className="w-7 h-7 rounded-full bg-slate-200 animate-pulse flex items-center justify-center">
                <Bot size={14} />
              </div>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
            placeholder={
              mode === ChatMode.IMAGE 
                ? "Describe la imagen que quieres generar..." 
                : mode === ChatMode.THINK 
                  ? "Plantea un problema difícil..." 
                  : "Haz una pregunta rápida..."
            }
            className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`p-3 rounded-2xl transition-all shadow-md ${
              loading || !input.trim() ? 'bg-slate-200 text-slate-400' : 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
