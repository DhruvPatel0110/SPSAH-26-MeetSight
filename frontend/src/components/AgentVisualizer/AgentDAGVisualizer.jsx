import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

const AGENT_NODES = [
  {
    id: 'coordinator',
    name: 'Lyzr Master Orchestrator',
    role: 'Decomposes transcript & directs task flow',
  },
  {
    id: 'summarizer',
    name: 'Executive Summarizer',
    role: 'Executive briefing, pillars & sentiment',
  },
  {
    id: 'decision_agent',
    name: 'Decision Engine',
    role: 'Resolutions, consensus & policy agreements',
  },
  {
    id: 'action_agent',
    name: 'Action Item Tracker',
    role: 'Tasks, assignees, deadlines & priorities',
  },
  {
    id: 'risk_agent',
    name: 'Risk & Blocker Analyzer',
    role: 'Blockers, dependencies & friction points',
  },
  {
    id: 'memory_agent',
    name: 'Qdrant Memory Indexer',
    role: 'Generates 384-d vectors & indexes payloads',
  }
];

const AgentDAGVisualizer = ({ agentStates = {}, isProcessing = false, activeAgentId = null }) => {
  const [expandedReasoning, setExpandedReasoning] = useState({});
  const [justCompleted, setJustCompleted] = useState({});
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const prevStatesRef = useRef(agentStates);

  const toggleReasoning = (id) => {
    setExpandedReasoning((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Flash sage-soft background when an agent finishes (fades out over 600ms)
  useEffect(() => {
    AGENT_NODES.forEach((node) => {
      const prev = prevStatesRef.current[node.id]?.status;
      const curr = agentStates[node.id]?.status;
      if (prev !== 'completed' && curr === 'completed') {
        setJustCompleted((prev) => ({ ...prev, [node.id]: true }));
        setTimeout(() => {
          setJustCompleted((prev) => ({ ...prev, [node.id]: false }));
        }, 600);
      }
    });
    prevStatesRef.current = agentStates;
  }, [agentStates]);

  // Calculate overall DAG progress
  const completedCount = AGENT_NODES.filter(
    (n) => agentStates[n.id]?.status === 'completed'
  ).length;
  const progressPct = Math.round((completedCount / AGENT_NODES.length) * 100);

  return (
    <div className="w-full bg-surface border border-line rounded-lg p-6 shadow-sm dark:shadow-none">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint">
            Agent pipeline
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted font-mono tabular-nums">
            {completedCount} of {AGENT_NODES.length} completed
          </span>
          {/* Mobile expand toggle button */}
          <button
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="lg:hidden p-1 text-ink-faint hover:text-ink rounded"
            aria-label="Toggle pipeline view"
          >
            {isMobileExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 4px accent progress bar with percentage in tabular-nums */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-ink-muted mb-1.5">
          <span>Overall progress</span>
          <span className="font-mono tabular-nums font-medium text-ink">{progressPct}%</span>
        </div>
        <div className="w-full h-1 bg-raised rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Stepper Body: on mobile collapsible, on desktop always visible */}
      <div className={`${isMobileExpanded ? 'block' : 'hidden lg:block'} space-y-0`}>
        {AGENT_NODES.map((node, index) => {
          const state = agentStates[node.id] || { status: 'idle', thought: 'Waiting in execution queue...' };
          const isThinking = state.status === 'thinking';
          const isCompleted = state.status === 'completed';
          const isFailed = state.status === 'failed';
          const isLast = index === AGENT_NODES.length - 1;
          const isExpanded = !!expandedReasoning[node.id];
          const flashed = !!justCompleted[node.id];

          // 10px status dot inside a ring: idle = ink-faint, running = accent with a pulse, done = sage with check, error = rose
          let statusLabel = 'Idle';
          if (isThinking) statusLabel = 'Running';
          else if (isCompleted) statusLabel = 'Completed';
          else if (isFailed) statusLabel = 'Failed';

          return (
            <div
              key={node.id}
              className={`relative flex gap-3 pb-5 last:pb-0 px-2 py-1.5 rounded-md transition-colors duration-600 ${
                flashed ? 'bg-sage-soft' : 'bg-transparent'
              }`}
            >
              {/* 1px vertical line connecting steps */}
              {!isLast && (
                <div
                  className="absolute left-[13px] top-[22px] bottom-0 w-[1px] bg-line"
                  aria-hidden="true"
                />
              )}

              {/* 10px status dot inside ring */}
              <div className="relative flex-shrink-0 pt-0.5">
                <div className="w-5 h-5 flex items-center justify-center">
                  {isCompleted ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-sage ring-2 ring-surface text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  ) : isThinking ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-accent ring-2 ring-accent/30 animate-pulse" />
                  ) : isFailed ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose ring-2 ring-rose/30" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-ink-faint ring-2 ring-surface" />
                  )}
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-sm font-medium text-ink truncate">
                    {node.name}
                  </h4>
                  <span className="text-xs text-ink-muted flex-shrink-0 font-mono tabular-nums">
                    {statusLabel}
                  </span>
                </div>
                
                <p className="text-xs text-ink-muted mt-0.5">
                  {node.role}
                </p>

                {/* Show reasoning toggle */}
                <div className="mt-1.5">
                  <button
                    onClick={() => toggleReasoning(node.id)}
                    className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent rounded"
                  >
                    <span>{isExpanded ? 'Hide reasoning' : 'Show reasoning'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>

                  {/* Expanded reasoning trace: raised background, mono text, 2px accent left border while running */}
                  {isExpanded && (
                    <div
                      className={`mt-2 p-3 bg-raised rounded-md text-[13px] font-mono text-ink leading-relaxed whitespace-pre-wrap break-words border border-line ${
                        isThinking ? 'border-l-2 border-l-accent' : ''
                      }`}
                    >
                      {state.thought || 'Waiting for pipeline execution...'}
                      {state.data && (
                        <div className="mt-2 pt-2 border-t border-line text-[11px] text-ink-muted">
                          <pre className="overflow-x-auto scrollbar-thin">
                            {JSON.stringify(state.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentDAGVisualizer;
