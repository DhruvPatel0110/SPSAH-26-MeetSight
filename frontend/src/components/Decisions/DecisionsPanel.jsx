import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Award, Tag, Sparkles } from 'lucide-react';

const DecisionsPanel = ({ decisions = [] }) => {
  if (!decisions || decisions.length === 0) {
    return (
      <div className="bg-[#0e142e]/80 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
        <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-40" />
        No explicit decisions extracted from this meeting yet.
      </div>
    );
  }

  return (
    <div className="bg-[#0e142e]/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Confirmed Decisions & Consensus</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {decisions.length} Approved
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Extracted by Lyzr Decision Engine and indexed into Qdrant semantic memory
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {decisions.map((dec, i) => {
          const text = typeof dec === 'string' ? dec : dec.text;
          const rationale = typeof dec === 'object' ? dec.rationale : null;
          const category = typeof dec === 'object' ? dec.category : 'General';

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all relative group"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {category || 'Decision'}
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Approved
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-100 leading-relaxed">
                {text}
              </p>
              {rationale && (
                <p className="text-[11px] text-slate-400 mt-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-slate-300 font-medium">Context:</span> {rationale}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DecisionsPanel;
