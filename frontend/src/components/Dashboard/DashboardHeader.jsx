import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Database, MessageSquare, CheckSquare } from 'lucide-react';
import ExportButton from '../Export/ExportButton';
import UserMenu from '../Auth/UserMenu';
import LoginModal from '../Auth/LoginModal';
import TranscriptHistory from '../History/TranscriptHistory';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardHeader = ({ transcript, summary, actionItems, onLoadTranscript, onOpenMemoryExplorer }) => {
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Serif Wordmark "MeetSight" + small pill "Voice · Multi-agent · Memory" in raised with ink-muted text */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-serif text-2xl font-semibold tracking-tight text-ink select-none">
              MeetSight
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-raised text-ink-muted hidden sm:inline-block">
              Voice · Multi-agent · Memory
            </span>
          </div>

          {/* Right: Actions in a single scrollable row on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1">
            {/* Memory ghost button */}
            <button
              onClick={onOpenMemoryExplorer}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-ink hover:bg-raised transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-canvas flex-shrink-0"
              title="Inspect vector memory in Qdrant"
            >
              <Database className="w-3.5 h-3.5 text-ink-muted" />
              <span>Memory</span>
            </button>

            {/* Actions ghost button with count shown as small accent-soft badge */}
            <button
              onClick={() => navigate('/actions')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-ink hover:bg-raised transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-canvas flex-shrink-0"
            >
              <CheckSquare className="w-3.5 h-3.5 text-ink-muted" />
              <span>Actions</span>
              {actionItems && actionItems.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[11px] font-mono tabular-nums font-semibold bg-accent-soft text-accent leading-none">
                  {actionItems.length}
                </span>
              )}
            </button>

            {/* Export ghost button */}
            <ExportButton
              transcript={transcript}
              summary={summary}
              actionItems={actionItems}
              variant="ghost"
            />

            {/* Theme Toggle - icon-only ghost button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-raised transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-canvas flex-shrink-0"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-accent" />
              ) : (
                <Moon className="w-4 h-4 text-ink-muted" />
              )}
            </button>

            {/* Memory Q&A in solid accent */}
            <button
              onClick={() => navigate('/chat')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-accent text-accent-ink hover:bg-accent-hover transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-canvas flex-shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Memory Q&A</span>
            </button>

            {/* Sign in as a text link / UserMenu */}
            {isAuthenticated ? (
              <UserMenu onHistoryClick={() => setShowHistory(true)} />
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-xs font-medium text-ink-muted hover:text-ink px-2 py-1.5 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent rounded flex-shrink-0"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

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
