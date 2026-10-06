import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

const RisksPanel = ({ risks = [] }) => {
  if (!risks || risks.length === 0) {
    return (
      <div className="bg-[#0e142e]/80 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
        <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-40" />
        No critical risks or blockers identified in this meeting.
      </div>
    );
  }

  const getSeverityStyle = (severity) => {
    switch ((severity || '').toLowerCase()) {
      case 'critical':
      case 'high':
        return {
          bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
          badge: 'bg-rose-950/60 text-rose-400 border-rose-800/40',
          border: 'hover:border-rose-500/40',
          icon: AlertCircle
        };
      case 'moderate':
      case 'medium':
        return {
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          badge: 'bg-amber-950/60 text-amber-400 border-amber-800/40',
          border: 'hover:border-amber-500/40',
          icon: AlertTriangle
        };
      default:
        return {
          bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
          badge: 'bg-blue-950/60 text-blue-400 border-blue-800/40',
          border: 'hover:border-blue-500/40',
          icon: ShieldAlert
        };
    }
  };

  return (
    <div className="bg-[#0e142e]/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 shadow-lg shadow-rose-500/10">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Identified Risks & Blockers</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {risks.length} Flagged
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Uncovered by Lyzr Risk Analyzer with actionable mitigation recommendations
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {risks.map((risk, i) => {
          const desc = typeof risk === 'string' ? risk : risk.description;
          const severity = typeof risk === 'object' ? risk.severity : 'medium';
          const mitigation = typeof risk === 'object' ? risk.suggested_mitigation : null;
          const style = getSeverityStyle(severity);
          const Icon = style.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-xl bg-slate-900/80 border border-slate-800 ${style.border} transition-all relative group`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${style.bg}`}>
                  <Icon className="w-3 h-3" />
                  Severity: {severity}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-200 leading-relaxed">
                {desc}
              </p>
              {mitigation && (
                <div className="text-[11px] text-slate-400 mt-2.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-emerald-400 font-semibold mb-0.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    Suggested Mitigation:
                  </div>
                  <span className="text-slate-300">{mitigation}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RisksPanel;
