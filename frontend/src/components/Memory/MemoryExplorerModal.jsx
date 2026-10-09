import { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  X,
  RefreshCw
} from 'lucide-react';
import { getQdrantMemoryStats, searchQdrantMemory } from '../../services/meetsightApi';

const MemoryExplorerModal = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await getQdrantMemoryStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching Qdrant stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
      setSearchResults([]);
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await searchQdrantMemory(searchQuery);
      setSearchResults(res.results || []);
    } catch (err) {
      console.error('Vector search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop: rgba(18,15,13,0.45) with NO blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#120F0D]/45 transition-opacity duration-200"
        aria-hidden="true"
      />

      {/* Surface Panel: rounded-xl, 1px line border, shadow-xl light mode only */}
      <div className="relative z-10 w-full max-w-3xl bg-surface border border-line rounded-xl shadow-xl dark:shadow-none p-6 sm:p-8 max-h-[88vh] flex flex-col my-4 transition-all duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sage" />
              <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint">
                Qdrant Memory Explorer
              </h3>
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Semantic recall and vector similarity search across meetings
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={fetchStats}
              className="p-1.5 rounded-md text-ink-faint hover:text-ink hover:bg-raised transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent"
              title="Refresh vector collection"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-ink-faint hover:text-ink hover:bg-raised transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-line">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint block">
              Vector Points
            </span>
            <span className="text-lg font-semibold font-mono tabular-nums text-ink mt-0.5 block">
              {stats?.total_memory_points ?? 0}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint block">
              Meetings
            </span>
            <span className="text-lg font-semibold font-mono tabular-nums text-ink mt-0.5 block">
              {stats?.total_meetings_indexed ?? 0}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint block">
              Dimensions
            </span>
            <span className="text-lg font-semibold font-mono tabular-nums text-ink mt-0.5 block">
              {stats?.vector_dimension ?? 384}d
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint block">
              Status
            </span>
            <span className="text-sm font-semibold text-sage mt-1 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sage" />
              Indexed
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="my-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Query semantic memory (e.g. 'OAuth callback', 'AWS credit')..."
                className="w-full pl-9 pr-3 py-2 bg-surface border border-line rounded-md text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 rounded-md bg-accent text-accent-ink hover:bg-accent-hover text-xs font-medium transition-colors duration-150 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Results List: similarity score as small horizontal bar in accent, snippet in serif, meeting name in ink-faint */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {searchResults.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-ink-muted mb-2">
                <span>Matches for "{searchQuery}"</span>
                <span className="font-mono tabular-nums">{searchResults.length} points returned</span>
              </div>
              <div className="divide-y divide-line border border-line rounded-lg overflow-hidden">
                {searchResults.map((pt, i) => {
                  const scoreVal = typeof pt.score === 'number' ? pt.score : parseFloat(pt.score) || 0.85;
                  const pct = Math.min(100, Math.max(10, Math.round(scoreVal * 100)));

                  return (
                    <div key={i} className="p-4 bg-surface hover:bg-raised transition-colors duration-150 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-ink-faint font-sans">
                          {pt.meeting_title || 'Sprint Sync'}
                        </span>
                        {/* Similarity score as small horizontal bar in accent */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-ink-faint">Cosine</span>
                          <div className="w-16 h-1.5 bg-raised rounded-full overflow-hidden border border-line">
                            <div className="h-full bg-accent transition-all duration-300" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-mono tabular-nums text-xs font-medium text-ink">
                            {pt.score}
                          </span>
                        </div>
                      </div>
                      {/* Snippet in serif */}
                      <p className="font-serif text-[14px] leading-relaxed text-ink italic">
                        "{pt.text}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : stats?.recent_points?.length > 0 ? (
            <div className="space-y-2">
              <div className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint mb-2">
                Recently indexed memory points
              </div>
              <div className="divide-y divide-line border border-line rounded-lg overflow-hidden">
                {stats.recent_points.map((pt, i) => (
                  <div key={i} className="p-4 bg-surface hover:bg-raised transition-colors duration-150 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-ink-faint font-sans">
                        {pt.meeting_title || 'Meeting Session'}
                      </span>
                      <span className="font-mono tabular-nums text-ink-faint text-[11px]">
                        ID {pt.id?.slice(0, 8)}
                      </span>
                    </div>
                    {/* Snippet in serif */}
                    <p className="font-serif text-[14px] leading-relaxed text-ink italic">
                      "{pt.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-ink-muted">
              <p className="font-serif text-base text-ink-muted mb-1">
                No vector points stored yet.
              </p>
              <p className="text-ink-faint">
                Run the agent pipeline on any transcript to embed into Qdrant.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryExplorerModal;
