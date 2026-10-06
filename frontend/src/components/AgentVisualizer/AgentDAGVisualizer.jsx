import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  FileText, 
  CheckCircle2, 
  ListTodo, 
  ShieldAlert, 
  Database, 
  Activity, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Zap
} from 'lucide-react';

const AGENT_NODES = [
  {
    id: 'coordinator',
    name: 'Lyzr Master Orchestrator',
    role: 'Decomposes transcript & directs task flow',
    icon: Zap,
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/40',
    accentColor: 'text-amber-400',
    badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
  },
  {
    id: 'summarizer',
    name: 'Executive Summarizer',
    role: 'Executive briefing, pillars & sentiment',
    icon: FileText,
    color: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/40',
    accentColor: 'text-cyan-400',
    badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
  },
  {
    id: 'decision_agent',
    name: 'Decision Engine',
    role: 'Resolutions, consensus & policy agreements',
    icon: CheckCircle2,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/40',
    accentColor: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
  },
  {
    id: 'action_agent',
    name: 'Action Item Tracker',
    role: 'Tasks, assignees, deadlines & priorities',
    icon: ListTodo,
    color: 'from-purple-500/20 to-indigo-500/20',
    borderColor: 'border-purple-500/40',
    accentColor: 'text-purple-400',
    badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
  },
  {
    id: 'risk_agent',
    name: 'Risk & Blocker Analyzer',
    role: 'Blockers, dependencies & friction points',
    icon: ShieldAlert,
    color: 'from-rose-500/20 to-red-500/20',
    borderColor: 'border-rose-500/40',
    accentColor: 'text-rose-400',
    badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30'
  },
  {
    id: 'memory_agent',
    name: 'Qdrant Memory Indexer',
    role: 'Generates 384-d vectors & indexes payloads',
    icon: Database,
    color: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/40',
    accentColor: 'text-blue-400',
    badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/30'
  }
];

const AgentDAGVisualizer = ({ agentStates = {}, isProcessing = false, activeAgentId = null }) => {
  const [expandedAgent, setExpandedAgent] = useState(null);

  // Calculate overall DAG progress
  const completedCount = AGENT_NODES.filter(
    (n) => agentStates[n.id]?.status === 'completed'
  ).length;
  const progressPct = Math.round((completedCount / AGENT_NODES.length) * 100);

  return (
    <div className="w-full bg-[#0e142e]/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-accent-purple/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800/80 gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
            <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-wide">
                Lyzr Multi-Agent Reasoning DAG
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Observable Workflows
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live step execution, reasoning thoughts, and persistent Qdrant memory indexing
            </p>
          </div>
        </div>

        {/* Status indicator & Progress */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-slate-400">
              DAG Completion: <strong className="text-cyan-400">{progressPct}%</strong>
            </span>
            <div className="w-32 h-2 bg-slate-800 rounded-full mt-1.5 overflow-hidden border border-slate-700/50">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <span className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'}`} />
            {isProcessing ? 'Orchestrating' : 'Ready'}
          </div>
        </div>
      </div>

      {/* DAG Node Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 relative z-10">
        {AGENT_NODES.map((node, index) => {
          const state = agentStates[node.id] || { status: 'idle', thought: 'Waiting in execution queue...' };
          const isThinking = state.status === 'thinking';
          const isCompleted = state.status === 'completed';
          const isFailed = state.status === 'failed';
          const Icon = node.icon;
          const isExpanded = expandedAgent === node.id;

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`rounded-xl border transition-all duration-300 relative overflow-hidden bg-slate-900/60 backdrop-blur-md ${
                isThinking
                  ? 'border-cyan-500 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-500/50'
                  : isCompleted
                  ? 'border-slate-800 hover:border-slate-700'
                  : 'border-slate-800/60 opacity-75'
              }`}
            >
              {/* Active Thinking Animated Stripe */}
              {isThinking && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${node.color} border ${node.borderColor}`}>
                      <Icon className={`w-5 h-5 ${node.accentColor}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                        {node.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{node.role}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isThinking && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                        <Sparkles className="w-3 h-3 animate-spin" /> Thinking
                      </span>
                    )}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    )}
                    {!isThinking && !isCompleted && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        Idle
                      </span>
                    )}
                  </div>
                </div>

                {/* Agent Thought / Real-Time Reasoning Log */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                    <Bot className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
                      Reasoning Trace:
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 font-mono leading-relaxed min-h-[52px]">
                    {state.thought || 'Waiting for pipeline trigger...'}
                  </p>
                </div>

                {/* Optional Data Preview Toggle */}
                {state.data && (
                  <div className="mt-2.5">
                    <button
                      onClick={() => setExpandedAgent(isExpanded ? null : node.id)}
                      className="w-full flex items-center justify-between text-[11px] font-medium text-slate-400 hover:text-cyan-400 transition-colors py-1"
                    >
                      <span>Inspect Agent Output Data</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800 max-h-48 overflow-y-auto font-mono text-cyan-200/90"
                        >
                          <pre>{JSON.stringify(state.data, null, 2)}</pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentDAGVisualizer;
