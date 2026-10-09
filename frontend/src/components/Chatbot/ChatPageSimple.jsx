import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CrossMeetingChat from './CrossMeetingChat';
import Button from '../UI/Button';

const ChatPageSimple = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      {/* Top Header */}
      <header className="bg-surface border-b border-line px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/')}
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
          >
            Dashboard
          </Button>
          <div className="h-4 w-px bg-line" />
          <div>
            <h1 className="font-serif text-xl font-semibold text-ink">Memory Q&A</h1>
            <p className="text-xs text-ink-muted hidden sm:block">
              Semantic retrieval across meetings using Qdrant vector memory
            </p>
          </div>
        </div>
      </header>

      {/* Main Chat Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <CrossMeetingChat />
      </main>
    </div>
  );
};

export default ChatPageSimple;