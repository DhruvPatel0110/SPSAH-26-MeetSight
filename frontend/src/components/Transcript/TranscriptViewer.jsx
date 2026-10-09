import { useState } from 'react';
import { Copy, Search, Check } from 'lucide-react';
import { SkeletonTranscript } from '../UI/Skeleton';

const TranscriptViewer = ({ transcript, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript?.text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightText = (text, search) => {
    if (!search.trim()) return text;
    
    const regex = new RegExp(`(${search})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-accent-soft text-accent font-medium px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (isLoading) {
    return (
      <section className="bg-surface border border-line rounded-lg p-6 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-ink-faint" />
          <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint">
            Transcript
          </h3>
        </div>
        <SkeletonTranscript />
      </section>
    );
  }

  if (!transcript) {
    return (
      <section className="bg-surface border border-line rounded-lg p-6 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-ink-faint" />
          <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint">
            Transcript
          </h3>
        </div>
        <p className="font-serif text-base text-ink-muted">
          No transcript available yet.
        </p>
        <p className="text-xs text-ink-faint mt-1">
          Start live voice capture or upload recorded audio to view timestamped dialogue.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-surface border border-line rounded-lg p-6 shadow-sm dark:shadow-none flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-ink-faint" />
          <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint">
            Transcript
          </h3>
          <span className="text-xs text-ink-muted font-mono tabular-nums ml-1">
            {transcript.wordCount ? `${transcript.wordCount} words` : ''}
          </span>
        </div>
        
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-ink hover:bg-raised transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-sage" /> : <Copy className="w-3.5 h-3.5 text-ink-muted" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter dialogue..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-surface border border-line rounded-md text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Transcript Text - JetBrains Mono 13px */}
      <div className="overflow-y-auto max-h-[380px] scrollbar-thin p-3.5 bg-raised border border-line rounded-lg">
        <div className="font-mono text-[13px] leading-relaxed text-ink whitespace-pre-wrap select-text">
          {highlightText(transcript.text, searchTerm)}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-line flex items-center justify-between text-xs text-ink-muted font-mono tabular-nums">
        <span>
          Recorded {transcript.uploadDate ? new Date(transcript.uploadDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${transcript.status === 'completed' ? 'bg-sage' : 'bg-ink-faint'}`} />
          <span className="capitalize">{transcript.status || 'Ready'}</span>
        </div>
      </div>
    </section>
  );
};

export default TranscriptViewer;
