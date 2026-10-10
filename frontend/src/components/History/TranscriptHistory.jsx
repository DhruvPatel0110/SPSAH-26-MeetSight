import { useState, useEffect } from 'react';
import { Calendar, Clock, Trash2, Eye } from 'lucide-react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import { getTranscriptHistory, deleteTranscript } from '../../services/firestoreService';
import { getHistoricalMeetings } from '../../services/meetsightApi';

const TranscriptHistory = ({ isOpen, onClose, onSelectTranscript }) => {
  const { user } = useAuth();
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadTranscripts();
    }
  }, [isOpen, user]);

  const loadTranscripts = async () => {
    setLoading(true);
    setError(null);

    const userId = user?.uid || user?.id;

    // Try Firestore first if user is logged in
    if (userId) {
      try {
        const result = await getTranscriptHistory(userId, 20);
        if (result.success && result.data && result.data.length > 0) {
          setTranscripts(result.data);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Firestore history unavailable, trying Qdrant meeting memory:', e);
      }
    }

    // Fallback: Fetch from Qdrant Persistent Memory via FastAPI
    try {
      const beResult = await getHistoricalMeetings(50);
      const meetings = (beResult?.meetings || []).map(m => ({
        id: m.id,
        filename: m.title || 'Meeting Session',
        createdAt: m.date,
        duration: m.duration || 'N/A',
        wordCount: m.preview ? m.preview.split(/\s+/).length : 0,
        text: m.preview || (m.summary?.overview || ''),
        summary: {
          keyPoints: m.summary?.key_points || [],
          sentiment: m.summary?.sentiment || 'Constructive',
          topics: m.summary?.topics || [],
          overview: m.summary?.overview || ''
        },
        decisions: m.decisions || [],
        actionItems: m.action_items || [],
        risks: m.risks || []
      }));
      setTranscripts(meetings);
    } catch (apiErr) {
      setError(apiErr.message || 'Failed to load historical sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (transcriptId) => {
    if (!confirm('Are you sure you want to delete this transcript?')) {
      return;
    }

    const userId = user?.uid || user?.id;
    if (userId) {
      try {
        await deleteTranscript(userId, transcriptId);
      } catch {
        // Ignored if local
      }
    }
    setTranscripts(transcripts.filter(t => t.id !== transcriptId));
  };

  const handleView = (transcript) => {
    onSelectTranscript?.(transcript);
    onClose();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recent';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transcript History" size="lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span className="font-mono tabular-nums">{transcripts.length} indexed sessions</span>
        </div>

        {/* Content */}
        <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-raised animate-pulse rounded-md" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-xs text-rose">{error}</p>
              <Button onClick={loadTranscripts} variant="secondary" size="sm" className="mt-3">
                Try Again
              </Button>
            </div>
          ) : transcripts.length === 0 ? (
            <div className="text-center py-10 text-xs text-ink-muted">
              <p className="font-serif text-base text-ink-muted mb-1">No saved transcripts found.</p>
              <p className="text-ink-faint">Process an audio file or live session to see history here.</p>
            </div>
          ) : (
            <div className="divide-y divide-line border border-line rounded-lg overflow-hidden">
              {transcripts.map((transcript) => (
                <div
                  key={transcript.id}
                  className="p-4 bg-surface hover:bg-raised transition-colors duration-150 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-ink truncate mb-1">
                      {transcript.filename || 'Untitled Transcript'}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted font-mono tabular-nums">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(transcript.createdAt)}
                      </span>
                      
                      {transcript.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {transcript.duration}
                        </span>
                      )}
                      
                      {transcript.wordCount > 0 && (
                        <span>
                          {transcript.wordCount} words
                        </span>
                      )}
                    </div>

                    {transcript.text && (
                      <p className="mt-2 text-xs font-mono text-ink-muted line-clamp-2">
                        {transcript.text}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      onClick={() => handleView(transcript)}
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                    >
                      View
                    </Button>
                    <Button
                      onClick={() => handleDelete(transcript.id)}
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      className="text-rose hover:bg-rose-soft"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TranscriptHistory;