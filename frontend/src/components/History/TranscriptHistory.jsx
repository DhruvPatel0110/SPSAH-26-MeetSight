// Transcript History Component
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, Clock, Trash2, Eye, X } from 'lucide-react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Card from '../UI/Card';
import { useAuth } from '../../contexts/AuthContext';
import { getTranscriptHistory, deleteTranscript } from '../../services/firestoreService';

const TranscriptHistory = ({ isOpen, onClose, onSelectTranscript }) => {
  const { user } = useAuth();
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      loadTranscripts();
    }
  }, [isOpen, user]);

  const loadTranscripts = async () => {
    setLoading(true);
    setError(null);

    const result = await getTranscriptHistory(user.uid, 20);

    if (result.success) {
      setTranscripts(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleDelete = async (transcriptId) => {
    if (!confirm('Are you sure you want to delete this transcript?')) {
      return;
    }

    const result = await deleteTranscript(user.uid, transcriptId);

    if (result.success) {
      setTranscripts(transcripts.filter(t => t.id !== transcriptId));
    } else {
      alert('Failed to delete transcript: ' + result.error);
    }
  };

  const handleView = (transcript) => {
    onSelectTranscript?.(transcript);
    onClose();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-purple/10 rounded-lg">
              <FileText className="w-6 h-6 text-accent-purple" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gradient">
                Transcript History
              </h2>
              <p className="text-sm text-text-secondary">
                {transcripts.length} saved transcripts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-status-error">{error}</p>
              <Button onClick={loadTranscripts} variant="secondary" className="mt-4">
                Try Again
              </Button>
            </div>
          ) : transcripts.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-accent-purple/10 rounded-full inline-block mb-4">
                <FileText className="w-12 h-12 text-accent-purple" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                No Transcripts Yet
              </h3>
              <p className="text-text-secondary">
                Upload an audio file to create your first transcript
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {transcripts.map((transcript, index) => (
                  <motion.div
                    key={transcript.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card hover className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-text-primary mb-2 truncate">
                            {transcript.filename || 'Untitled Transcript'}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(transcript.createdAt)}
                            </span>
                            
                            {transcript.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {transcript.duration}
                              </span>
                            )}
                            
                            {transcript.wordCount && (
                              <span>
                                {transcript.wordCount} words
                              </span>
                            )}
                          </div>

                          {transcript.text && (
                            <p className="mt-2 text-sm text-text-secondary line-clamp-2">
                              {transcript.text}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
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
                            className="text-status-error hover:bg-status-error/10"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TranscriptHistory;

// Made with Bob