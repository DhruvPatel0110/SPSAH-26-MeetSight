import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Sparkles, Brain, Clock, ShieldCheck, Database, Volume2 } from 'lucide-react';

const ProcessingModal = ({ isOpen, filename = 'Audio Recording' }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval;
    if (isOpen) {
      setSeconds(0);
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Stages display based on elapsed seconds
  const currentStage = seconds < 10 
    ? 'Transcribing audio via Whisper Large V3...'
    : seconds < 35 
      ? 'Lyzr Multi-Agent DAG: Extracting summary, decisions & action items...'
      : 'Groq Token Cooldown Active: Finalizing risks & indexing into Qdrant...';

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0c0a09]/80 backdrop-blur-sm transition-opacity duration-300" 
        aria-hidden="true" 
      />

      {/* Modal Surface */}
      <div className="relative z-10 w-full max-w-lg bg-[#181615] border border-amber-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 text-neutral-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glowing Ambient Gradient */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon + Title */}
        <div className="flex items-start gap-4 mb-5">
          <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400 shrink-0 animate-pulse">
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-serif font-bold text-neutral-100 tracking-tight">
                Processing Meeting Intelligence
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Active DAG
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 truncate max-w-xs">
              Analyzing: <span className="text-neutral-200 font-mono">{filename}</span>
            </p>
          </div>
        </div>

        {/* Prominent Patience Notification Banner */}
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-300 space-y-1">
              <p className="font-semibold text-amber-200">
                Please wait patiently while your file is processing!
              </p>
              <p className="text-neutral-400 leading-relaxed">
                MeetSight coordinates an autonomous <strong>5-agent cognitive graph</strong> (Summarizer, Decision Engine, Action Tracker, Risk Analyzer & Qdrant Indexer).
              </p>
              <p className="text-neutral-400 leading-relaxed">
                To respect Groq token rate limits and allow 36s token cooldowns between agents, large audio files take <strong>30 to 60 seconds</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Pipeline Stages Indicator */}
        <div className="space-y-3 mb-6 bg-neutral-900/50 border border-neutral-800 rounded-xl p-3.5 text-xs">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="font-medium text-neutral-300 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              {currentStage}
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {seconds}s elapsed
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-300 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(95, Math.max(15, seconds * 2))}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-neutral-400 text-center">
            <div className={`p-1.5 rounded border ${seconds >= 0 ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-neutral-800'}`}>
              <Volume2 className="w-3 h-3 mx-auto mb-1" />
              1. Whisper STT
            </div>
            <div className={`p-1.5 rounded border ${seconds >= 10 ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-neutral-800'}`}>
              <Brain className="w-3 h-3 mx-auto mb-1" />
              2. 5-Agent DAG
            </div>
            <div className={`p-1.5 rounded border ${seconds >= 35 ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-neutral-800'}`}>
              <Database className="w-3 h-3 mx-auto mb-1" />
              3. Qdrant Memory
            </div>
          </div>
        </div>

        {/* Reassurance Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-[11px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Groq rate pacing active • Auto-recovering</span>
          </div>
          <span className="text-neutral-400 italic">Do not refresh tab</span>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default ProcessingModal;
