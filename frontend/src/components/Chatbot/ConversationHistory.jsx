import { useState, useEffect } from 'react';
import { MessageSquare, Clock, ChevronRight } from 'lucide-react';
import Card from '../UI/Card';
import { getUserConversations, getTranscriptConversations } from '../../services/conversationService';
import { useAuth } from '../../contexts/AuthContext';

const ConversationHistory = ({ transcriptId, onSelectConversation, currentConversationId }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [user, transcriptId]);

  const loadConversations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let result;
      if (transcriptId) {
        result = await getTranscriptConversations(user.uid, transcriptId);
      } else {
        result = await getUserConversations(user.uid);
      }

      if (result.success) {
        setConversations(result.data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-14 bg-surface-2 rounded-md" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-ink-muted" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          {transcriptId ? 'This Meeting' : 'All Conversations'}
        </h3>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-6 text-xs text-ink-muted">
          No conversations yet. Start asking questions to view history.
        </div>
      ) : (
        <div className="space-y-1.5">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full text-left p-3 rounded-md transition-colors border ${
                currentConversationId === conversation.id
                  ? 'bg-surface-2 border-line text-ink'
                  : 'bg-surface hover:bg-surface-2 border-transparent text-ink'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-ink truncate">
                    {conversation.title}
                  </h4>
                  {conversation.lastMessage && (
                    <p className="text-xs text-ink-muted truncate mt-0.5">
                      {conversation.lastMessage}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-ink-faint font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(conversation.updatedAt)}</span>
                    {conversation.messages && (
                      <span>• {conversation.messages.length} msgs</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-faint flex-shrink-0 mt-0.5" />
              </div>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ConversationHistory;