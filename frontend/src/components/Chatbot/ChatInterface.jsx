import { useState, useEffect } from 'react';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import Card from '../UI/Card';
import { 
  createConversation, 
  getConversation, 
  addMessageToConversation 
} from '../../services/conversationService';
import { useAuth } from '../../contexts/AuthContext';
import { askRagQuestion } from '../../services/ragService';

const ChatInterface = ({ transcript, transcriptId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your meeting assistant. I've analyzed your meeting and I'm ready to answer any questions. What would you like to know?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    if (user && transcriptId && !conversationId) {
      initConversation();
    }
  }, [user, transcriptId]);

  const initConversation = async () => {
    try {
      const result = await createConversation(
        user.uid,
        transcriptId,
        transcript?.filename ? `Chat: ${transcript.filename}` : 'Meeting Chat'
      );
      if (result.success) {
        setConversationId(result.conversationId);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      if (conversationId) {
        await addMessageToConversation(conversationId, 'user', userMessage.content);
      }

      const ragResponse = await askRagQuestion(
        transcript?.text || '',
        userMessage.content,
        messages
      );

      const assistantMessage = {
        role: 'assistant',
        content: ragResponse.answer,
        sources: ragResponse.sources
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (conversationId) {
        await addMessageToConversation(
          conversationId,
          'assistant',
          assistantMessage.content,
          assistantMessage.sources
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <div className="text-center">
            <h3 className="text-sm font-semibold text-ink mb-1">
              Preparing Meeting for Q&A
            </h3>
            <p className="text-ink-muted text-xs">
              Indexing transcript for intelligent search...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px] p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-line">
        <div className="p-2 bg-surface-2 rounded-md">
          <MessageSquare className="w-4 h-4 text-ink-muted" />
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink">Meeting Q&A</h3>
          <p className="text-xs text-ink-muted">Ask questions about this meeting</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-md p-3 text-xs leading-relaxed border ${
                message.role === 'user'
                  ? 'bg-surface-2 border-line text-ink'
                  : 'bg-surface border-line text-ink'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-line">
                  <p className="text-[11px] text-ink-muted mb-1 font-semibold">Sources:</p>
                  {message.sources.map((source, idx) => (
                    <div key={idx} className="text-[11px] text-ink-muted italic mb-0.5">
                      • {source.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface border border-line rounded-md p-3 flex items-center gap-2 text-xs text-ink-muted">
              <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-line bg-surface">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a question about this meeting..."
            disabled={isLoading}
            className="flex-1 bg-surface border border-line rounded-md px-3.5 py-2 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-3.5 py-2 bg-accent text-accent-ink hover:bg-accent-hover rounded-md text-xs font-medium transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </Card>
  );
};

export default ChatInterface;