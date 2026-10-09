const DecisionsPanel = ({ decisions = [] }) => {
  if (!decisions || decisions.length === 0) {
    return (
      <section className="bg-surface border border-line rounded-lg p-6 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber" />
          <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint">
            Decisions
          </h3>
        </div>
        <p className="font-serif text-base text-ink-muted">
          No consensus decisions recorded yet.
        </p>
        <p className="text-xs text-ink-faint mt-1">
          Confirmed team resolutions and architectural choices will appear here.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-surface border border-line rounded-lg p-6 shadow-sm dark:shadow-none space-y-4">
      {/* Header with 6px amber dot & amber decision count badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber" />
          <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint">
            Decisions
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-mono tabular-nums font-semibold bg-amber-soft text-amber">
          {decisions.length}
        </span>
      </div>

      {/* Decision Cards with 3px amber left border */}
      <div className="space-y-3">
        {decisions.map((dec, i) => {
          const text = typeof dec === 'string' ? dec : (dec.text || dec.decision || dec.title || '');
          const rationale = typeof dec === 'object' ? dec.rationale : null;
          const category = typeof dec === 'object' ? (dec.category || 'Consensus') : 'Consensus';
          const status = typeof dec === 'object' ? (dec.status || 'Approved') : 'Approved';
          const author = typeof dec === 'object' && dec.author ? dec.author : null;
          const time = typeof dec === 'object' && dec.timestamp ? dec.timestamp : null;

          return (
            <div
              key={i}
              className="bg-surface border border-line border-l-[3px] border-l-amber rounded-lg p-4 shadow-sm dark:shadow-none hover:bg-raised transition-colors duration-150 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium text-ink leading-relaxed">
                  {text}
                </p>
                {time && (
                  <span className="font-mono tabular-nums text-xs text-ink-faint flex-shrink-0 pt-0.5">
                    {time}
                  </span>
                )}
              </div>

              {/* Category, Status & Rationale */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted pt-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-soft text-amber">
                    {category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-sage-soft text-sage capitalize">
                    {status}
                  </span>
                  {author && (
                    <span className="text-ink-muted">
                      by <span className="text-ink font-medium">{author}</span>
                    </span>
                  )}
                </div>

                {rationale && (
                  <span className="text-ink-faint text-xs italic max-w-sm" title={rationale}>
                    {rationale}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DecisionsPanel;
