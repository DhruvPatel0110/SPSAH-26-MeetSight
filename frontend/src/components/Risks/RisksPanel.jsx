import { AlertTriangle } from 'lucide-react';

const RisksPanel = ({ risks = [] }) => {
  if (!risks || risks.length === 0) {
    return (
      <section className="bg-surface border border-line rounded-lg p-6 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose" />
          <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint">
            Risks & Blockers
          </h3>
        </div>
        <p className="font-serif text-base text-ink-muted">
          No critical blockers or dependency risks identified.
        </p>
        <p className="text-xs text-ink-faint mt-1">
          Delivery bottlenecks and escalation points will appear here.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-surface border border-line rounded-lg p-6 shadow-sm dark:shadow-none space-y-4">
      {/* Header with 6px rose dot */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose" />
          <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint">
            Risks & Blockers
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-mono tabular-nums font-semibold bg-rose-soft text-rose">
          {risks.length} flagged
        </span>
      </div>

      {/* Cards list */}
      <div className="space-y-3">
        {risks.map((risk, i) => {
          const desc = typeof risk === 'string' ? risk : (risk.description || risk.risk || risk.text || '');
          const severity = typeof risk === 'object' ? (risk.severity || 'medium').toLowerCase() : 'medium';
          const mitigation = typeof risk === 'object' ? risk.suggested_mitigation : null;
          const dependency = typeof risk === 'object' && risk.dependency ? risk.dependency : null;

          // Severity chip (high = rose-soft with rose text, medium = amber-soft with amber text)
          let severityChip = 'bg-amber-soft text-amber';
          let severityLabel = 'Medium severity';
          if (severity === 'critical' || severity === 'high') {
            severityChip = 'bg-rose-soft text-rose';
            severityLabel = 'High severity';
          }

          return (
            <div
              key={i}
              className="bg-surface border border-line rounded-lg p-5 shadow-sm dark:shadow-none hover:bg-raised transition-colors duration-150 flex flex-col gap-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-ink leading-relaxed">
                  {desc}
                </p>
                {/* Rose-soft severity chip */}
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium flex-shrink-0 select-none ${severityChip}`}>
                  {severityLabel}
                </span>
              </div>

              {/* Dependency line if provided */}
              {dependency && (
                <div className="text-xs text-ink-muted">
                  Dependency: <span className="text-ink font-medium">{dependency}</span>
                </div>
              )}

              {/* Proposed mitigation row with a dashed top border */}
              {mitigation && (
                <div className="border-t border-dashed border-line pt-2.5 text-xs text-ink-muted leading-relaxed">
                  <span className="font-semibold text-ink">Proposed mitigation: </span>
                  {mitigation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RisksPanel;
