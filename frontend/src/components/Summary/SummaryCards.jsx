const SummaryCards = ({ summary, isLoading = false }) => {
  if (isLoading) {
    return (
      <section className="bg-surface border border-line rounded-lg p-6 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint">
            Summary
          </h3>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-raised rounded w-3/4" />
          <div className="h-4 bg-raised rounded w-full" />
          <div className="h-4 bg-raised rounded w-5/6" />
        </div>
      </section>
    );
  }

  if (!summary) {
    return (
      <section className="bg-surface border border-line rounded-lg p-6 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint">
            Summary
          </h3>
        </div>
        <p className="font-serif text-base text-ink-muted">
          No executive summary generated yet.
        </p>
        <p className="text-xs text-ink-faint mt-1">
          Start a live capture session or load demo data to analyze discussions.
        </p>
      </section>
    );
  }

  // Sentiment chip styling (sage-soft with sage text if positive, amber-soft if mixed, rose-soft if negative)
  const sentimentVal = (summary.sentiment || '').toLowerCase();
  let sentimentChipClass = 'bg-amber-soft text-amber';
  let sentimentLabel = summary.sentiment || 'Constructive';
  if (sentimentVal.includes('positive') || sentimentVal.includes('constructive')) {
    sentimentChipClass = 'bg-sage-soft text-sage';
    sentimentLabel = 'Positive';
  } else if (sentimentVal.includes('negative') || sentimentVal.includes('critical')) {
    sentimentChipClass = 'bg-rose-soft text-rose';
    sentimentLabel = 'Negative';
  } else if (sentimentVal.includes('mixed') || sentimentVal.includes('neutral')) {
    sentimentChipClass = 'bg-amber-soft text-amber';
    sentimentLabel = 'Mixed';
  }

  const overviewText = summary.overview || 
    (summary.keyPoints && summary.keyPoints.length > 0 
      ? summary.keyPoints.map(p => typeof p === 'string' ? p : `${p.title || ''}: ${p.description || ''}`).join(' ')
      : 'Comprehensive discussion covering architecture decisions, task allocations, and milestone dependencies.');

  return (
    <section className="bg-surface border border-line rounded-lg p-6 shadow-sm dark:shadow-none space-y-6">
      {/* Header with 6px dot section label & top-right sentiment chip */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint">
            Summary
          </h3>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium font-sans select-none ${sentimentChipClass}`}>
          {sentimentLabel}
        </span>
      </div>

      {/* Summary paragraph in the serif at 17px with line-height 1.7 and max-w-[65ch] */}
      <div className="font-serif text-[17px] leading-[1.7] max-w-[65ch] text-ink">
        <p>
          {overviewText}
        </p>
      </div>

      {/* Key Discussion Points - handles both string arrays and {title, description} objects */}
      {summary.keyPoints && summary.keyPoints.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
            Key Discussion Points
          </div>
          <div className="border border-line rounded-md divide-y divide-line overflow-hidden bg-surface">
            {summary.keyPoints.map((point, index) => {
              const isString = typeof point === 'string';
              const title = isString ? null : (point.title || point.heading || point.point);
              const textContent = isString ? point : (point.description || point.text || point.detail || point.title || '');

              if (!textContent && !title) return null;

              return (
                <div key={point.id || index} className="p-3.5 bg-surface hover:bg-raised transition-colors duration-150 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-accent-soft text-accent text-xs font-mono font-medium flex items-center justify-center flex-shrink-0 mt-0.5 select-none">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    {title && (
                      <h4 className="text-sm font-medium text-ink mb-1">
                        {title}
                      </h4>
                    )}
                    <p className="text-sm text-ink-muted leading-relaxed">
                      {textContent}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Topics Discussed */}
      {summary.topics && summary.topics.length > 0 && (
        <div className="pt-1">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-2">
            Topics Discussed
          </div>
          <div className="flex flex-wrap gap-1.5">
            {summary.topics.map((topic, index) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-raised text-ink-muted rounded text-xs font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default SummaryCards;
