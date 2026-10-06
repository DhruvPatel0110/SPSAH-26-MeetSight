import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Search, 
  Cpu, 
  Layers, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Tag, 
  X,
  Sparkles,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-4xl bg-[#0d1430] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Glow backgrounds */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 shadow-lg shadow-blue-500/10">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">Qdrant Persistent Vector Memory Explorer</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  bge-small-en-v1.5
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time inspection of high-dimensional meeting vectors, payload schemas, and similarity metrics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Refresh Qdrant metrics"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5 relative z-10">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Total Vector Points</span>
            <span className="text-2xl font-bold text-white mt-1 block">
              {stats?.total_memory_points ?? 0}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Meetings Indexed</span>
            <span className="text-2xl font-bold text-cyan-400 mt-1 block">
              {stats?.total_meetings_indexed ?? 0}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Embedding Dimension</span>
            <span className="text-2xl font-bold text-purple-400 mt-1 block">
              {stats?.vector_dimension ?? 384}d
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Distance Metric</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">
              {stats?.distance_metric ?? 'Cosine'}
            </span>
          </div>
        </div>

        {/* Interactive Vector Search Bar */}
        <form onSubmit={handleSearch} className="mb-4 relative z-10">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-2xl p-2 focus-within:border-blue-500/50 transition-all">
            <Search className="w-4 h-4 text-slate-400 ml-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Test semantic similarity (e.g. 'authentication OAuth', 'AWS deploy', 'Alex database')..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-2"
            />
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Vector Search</span>
            </button>
          </div>
        </form>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 relative z-10">
          {searchResults.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                <span>Vector Search Matches for: <strong className="text-white">"{searchQuery}"</strong></span>
                <span className="text-blue-400 font-semibold">{searchResults.length} points returned</span>
              </div>
              <div className="space-y-2.5">
                {searchResults.map((pt, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {pt.category}
                        </span>
                        <span className="text-xs text-slate-300 font-medium">{pt.meeting_title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                        <span>Cosine: {pt.score}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">{pt.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : stats?.recent_points?.length > 0 ? (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Recently Indexed Memory Points
              </div>
              <div className="space-y-2.5">
                {stats.recent_points.map((pt, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                          {pt.category}
                        </span>
                        <span className="text-xs text-slate-400">{pt.meeting_title}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">{pt.id.slice(0, 8)}...</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{pt.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Database className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              No memory points indexed yet. Run the Lyzr agent DAG on a meeting to populate Qdrant vector memory!
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MemoryExplorerModal;
