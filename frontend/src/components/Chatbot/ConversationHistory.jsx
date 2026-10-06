import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
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
        // Get conversations for specific transcript
        result = await getTranscriptConversations(user.uid, transcriptId);
      } else {
        // Get all user conversations
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
              <div className="h-16 bg-gray-800/50 rounded-lg"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">
          {transcriptId ? 'This Meeting' : 'All Conversations'}
        </h3>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No conversations yet</p>
          <p className="text-gray-500 text-xs mt-1">
            Start asking questions about your meetings
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <motion.button
              key={conversation.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                currentConversationId === conversation.id
                  ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
                  : 'bg-gray-800/30 hover:bg-gray-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">
                    {conversation.title}
                  </h4>
                  {conversation.lastMessage && (
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {formatDate(conversation.updatedAt)}
                    </span>
                    {conversation.messages && (
                      <span className="text-xs text-gray-500">
                        • {conversation.messages.length} messages
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ConversationHistory;

// Made with Bob