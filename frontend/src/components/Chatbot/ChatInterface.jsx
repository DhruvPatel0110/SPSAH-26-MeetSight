import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../UI/Button';
import Card from '../UI/Card';
import { answerQuestion, indexTranscript, isTranscriptIndexed } from '../../services/ragService';
import { createConversation, addMessage, getConversation } from '../../services/conversationService';
import { useAuth } from '../../contexts/AuthContext';

const ChatInterface = ({ transcript, transcriptId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isIndexed, setIsIndexed] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation and check indexing status
  useEffect(() => {
    const initializeChat = async () => {
      if (!user || !transcriptId) return;

      try {
        // Check if transcript is indexed
        const indexed = await isTranscriptIndexed(user.uid, transcriptId);
        setIsIndexed(indexed);

        // If not indexed, index it
        if (!indexed && transcript) {
          setIsIndexing(true);
          await indexTranscript(user.uid, transcriptId, transcript);
          setIsIndexed(true);
          setIsIndexing(false);
        }

        // Create a new conversation
        const result = await createConversation(
          user.uid,
          transcriptId,
          'Meeting Q&A'
        );

        if (result.success) {
          setConversationId(result.id);
          
          // Add welcome message
          const welcomeMessage = {
            role: 'assistant',
            content: "Hi! I'm ready to answer questions about this meeting. What would you like to know?",
          };
          setMessages([welcomeMessage]);
        }
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Failed to initialize chat. Please try again.');
      }
    };

    initializeChat();
  }, [user, transcriptId, transcript]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !conversationId) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
    };

    // Add user message to UI
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Save user message to Firestore
      await addMessage(conversationId, userMessage);

      // Get answer using RAG
      const result = await answerQuestion(
        user.uid,
        transcriptId,
        userMessage.content,
        messages
      );

      if (result.success) {
        const assistantMessage = {
          role: 'assistant',
          content: result.answer,
          sources: result.sources,
        };

        // Add assistant message to UI
        setMessages(prev => [...prev, assistantMessage]);

        // Save assistant message to Firestore
        await addMessage(conversationId, assistantMessage);
      } else {
        throw new Error(result.error || 'Failed to get answer');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to get answer. Please try again.');
      
      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try asking your question again.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isIndexing) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              Preparing Meeting for Q&A
            </h3>
            <p className="text-gray-400 text-sm">
              Indexing transcript for intelligent search... This may take a moment.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-800">
        <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Meeting Q&A</h3>
          <p className="text-sm text-gray-400">Ask questions about this meeting</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-white'
                    : 'bg-gray-800/50 text-gray-100'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.role === 'assistant' && (
                    <Sparkles className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Show sources if available */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Sources from meeting:</p>
                        {message.sources.map((source, idx) => (
                          <div key={idx} className="text-xs text-gray-500 mb-1">
                            • {source.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="text-sm text-gray-400">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about the meeting..."
            disabled={isLoading || !isIndexed}
            className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading || !isIndexed}
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </Card>
  );
};

export default ChatInterface;

// Made with Bob