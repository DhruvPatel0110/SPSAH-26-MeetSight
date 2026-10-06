import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Database } from 'lucide-react';
import CrossMeetingChat from './CrossMeetingChat';

const ChatPageSimple = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070b1e] text-white flex flex-col">
      {/* Top Header */}
      <header className="bg-[#0b1029]/90 border-b border-slate-800 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <div className="h-5 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white">Cross-Meeting Memory Chatbot</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Qdrant Vector DB
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400 hidden sm:block">
          Retrieves historical context & decisions across all indexed sessions
        </div>
      </header>

      {/* Main Chat Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        <CrossMeetingChat />
      </main>
    </div>
  );
};

export default ChatPageSimple;