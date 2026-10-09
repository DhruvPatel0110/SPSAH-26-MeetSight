const DEFAULT_PARTICIPANTS = [
  { name: 'Rahul Sharma', initials: 'RS' },
  { name: 'Sarah Jenkins', initials: 'SJ' },
  { name: 'Alex Rivera', initials: 'AR' },
  { name: 'Elena Rostova', initials: 'ER' },
];

const MeetingHeader = ({ transcript }) => {
  const title = transcript?.filename || 'Sprint Architecture & Infrastructure Sync';
  
  const dateFormatted = transcript?.uploadDate
    ? new Date(transcript.uploadDate).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Today, Oct 8, 2026';

  const durationFormatted = transcript?.duration || '42m 18s';
  const participants = transcript?.speakers?.map((s) => ({
    name: s,
    initials: s.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  })) || DEFAULT_PARTICIPANTS;

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-line">
      {/* Title & Metadata */}
      <div>
        <h1 className="font-serif text-[28px] font-medium tracking-tight text-ink leading-tight">
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted mt-2 font-mono tabular-nums">
          <span>{dateFormatted}</span>
          <span className="text-ink-faint">·</span>
          <span>{durationFormatted}</span>
          <span className="text-ink-faint">·</span>
          <span>{participants.length} participants</span>
        </div>
      </div>

      {/* Overlapping participant avatars on raised backgrounds with a 2px canvas ring */}
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2 overflow-hidden items-center py-1">
          {participants.map((person, i) => (
            <div
              key={i}
              title={person.name}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-raised text-ink text-xs font-medium ring-2 ring-canvas select-none shadow-sm dark:shadow-none"
            >
              {person.initials}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MeetingHeader;
