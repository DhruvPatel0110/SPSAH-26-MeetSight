import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, LogIn, CheckSquare, MessageSquare, Database, Radio, Bot } from 'lucide-react';
import ExportButton from '../Export/ExportButton';
import UserMenu from '../Auth/UserMenu';
import LoginModal from '../Auth/LoginModal';
import TranscriptHistory from '../History/TranscriptHistory';
import Button from '../UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useTranscript } from '../../contexts/TranscriptContext';

const DashboardHeader = ({ transcript, summary, actionItems, onLoadTranscript, onOpenMemoryExplorer }) => {
  const { isAuthenticated } = useAuth();
  const { transcript: contextTranscript } = useTranscript();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary-surface/95 border-b border-white/10 sticky top-0 z-40 backdrop-blur-md overflow-visible"
      >
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 py-4 overflow-visible">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 overflow-visible relative">
            {/* Logo and Title */}
            <div className="flex items-center gap-3.5">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="p-2.5 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl shadow-lg shadow-cyan-500/20"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    MeetSight
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30">
                    Solo Agents 2026
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="text-cyan-400 font-semibold">Omi</span> Voice
                  <span>•</span>
                  <span className="text-purple-400 font-semibold">Lyzr</span> Multi-Agent
                  <span>•</span>
                  <span className="text-blue-400 font-semibold">Qdrant</span> Persistent Memory
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Qdrant Memory Explorer Trigger */}
              <button
                onClick={onOpenMemoryExplorer}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold shadow-sm transition-all"
                title="Inspect persistent vectors in Qdrant"
              >
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>Qdrant Memory</span>
              </button>

              {/* Chat with Cross-Meeting Memory Button */}
              <Button
                onClick={() => navigate('/chat')}
                variant="primary"
                size="sm"
                icon={MessageSquare}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 shadow-md shadow-purple-500/20"
              >
                Memory Q&A
              </Button>
              
              {actionItems && actionItems.length > 0 && (
                <Button
                  onClick={() => navigate('/actions')}
                  variant="secondary"
                  size="sm"
                  icon={CheckSquare}
                >
                  Actions ({actionItems.length})
                </Button>
              )}
              
              <ExportButton
                transcript={transcript}
                summary={summary}
                actionItems={actionItems}
              />
              
              {isAuthenticated ? (
                <UserMenu onHistoryClick={() => setShowHistory(true)} />
              ) : (
                <Button
                  onClick={() => setShowLoginModal(true)}
                  variant="ghost"
                  size="sm"
                  icon={LogIn}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Transcript History Modal */}
      <TranscriptHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectTranscript={(item) => {
          if (onLoadTranscript) onLoadTranscript(item);
          setShowHistory(false);
        }}
      />
    </>
  );
};

export default DashboardHeader;
