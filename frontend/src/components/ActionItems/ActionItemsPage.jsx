import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckSquare, Sparkles } from 'lucide-react';
import ActionItemsPanel from './ActionItemsPanel';
import Button from '../UI/Button';
import { useTranscript } from '../../contexts/TranscriptContext';

const ActionItemsPage = () => {
  const navigate = useNavigate();
  const { actionItems } = useTranscript();

  return (
    <div className="min-h-screen bg-primary-bg">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary-surface/95 border-b border-white/10 sticky top-0 z-30 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/')}
                variant="secondary"
                size="sm"
                icon={ArrowLeft}
              >
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                  className="p-2 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-xl"
                >
                  <CheckSquare className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">
                    Action Items
                  </h1>
                  <p className="text-sm text-text-muted">
                    Manage your tasks and action items
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ActionItemsPanel actionItems={actionItems} />
        </motion.div>
      </main>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-purple/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default ActionItemsPage;

// Made with Bob