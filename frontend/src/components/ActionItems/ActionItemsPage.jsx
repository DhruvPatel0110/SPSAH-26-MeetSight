import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ActionItemsPanel from './ActionItemsPanel';
import Button from '../UI/Button';
import { useTranscript } from '../../contexts/TranscriptContext';

const ActionItemsPage = () => {
  const navigate = useNavigate();
  const { actionItems } = useTranscript();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
            >
              Back
            </Button>
            <div>
              <h1 className="font-serif text-2xl font-semibold text-ink tracking-tight">
                Action Items
              </h1>
              <p className="text-xs text-ink-muted">
                Task extraction and assignment management
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ActionItemsPanel actionItems={actionItems} />
      </main>
    </div>
  );
};

export default ActionItemsPage;