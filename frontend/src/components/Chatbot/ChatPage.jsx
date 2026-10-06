import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, Sparkles, ArrowLeft, MessageSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { answerQuestion, indexTranscript, isTranscriptIndexed } from '../../services/ragService';
import { createConversation, addMessage } from '../../services/conversationService';
import { useAuth } from '../../contexts/AuthContext';
import { useTranscript } from '../../contexts/TranscriptContext';

const ChatPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transcript, transcriptId, summary, actionItems } = useTranscript();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isIndexed, setIsIndexed] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Initialize chat with transcript data
  useEffect(() => {
    const initializeChat = async () => {
      console.log('🚀 Initializing chat...');
      console.log('Transcript:', transcript);
      console.log('TranscriptId:', transcriptId);
      console.log('User:', user);
      
      // Check if we have transcript data
      if (!transcript) {
        console.log('❌ No transcript');
        setError('No transcript available. Please upload a meeting first.');
        return;
      }

      if (!user) {
        console.log('❌ No user');
        setError('Please log in to use the chat feature.');
        return;
      }

      try {
        // Get the transcript text - it might be in transcript.text or transcript.transcript
        const transcriptText = transcript.text || transcript.transcript;
        console.log('Transcript text length:', transcriptText?.length);
        
        if (!transcriptText) {
          console.log('❌ No transcript text');
          setError('Transcript text not found. Please try uploading again.');
          return;
        }

        // Use transcriptId from context, or generate one from transcript.id
        const activeTranscriptId = transcriptId || transcript.id?.toString();
        console.log('Active transcript ID:', activeTranscriptId);
        
        if (!activeTranscriptId) {
          console.log('❌ No transcript ID');
          setError('Transcript ID not found. Please ensure the transcript is saved.');
          return;
        }

        // Use user.id instead of user.uid (AuthContext uses 'id')
        const userId = user.uid || user.id;
        console.log('User ID:', userId);

        // Check if transcript is indexed
        console.log('🔍 Checking if transcript is indexed...');
        const indexed = await isTranscriptIndexed(userId, activeTranscriptId);
        console.log('Indexed:', indexed);
        setIsIndexed(indexed);

        // If not indexed, index it
        if (!indexed) {
          console.log('📝 Indexing transcript...');
          setIsIndexing(true);
          await indexTranscript(userId, activeTranscriptId, transcriptText);
          setIsIndexed(true);
          setIsIndexing(false);
          console.log('✅ Indexing complete');
        }

        // Create a new conversation
        console.log('💬 Creating conversation...');
        const result = await createConversation(
          userId,
          activeTranscriptId,
          'Chat with MeetIQ'
        );
        console.log('Conversation result:', result);

        if (result.success) {
          console.log('✅ Conversation created:', result.id);
          setConversationId(result.id);
          
          // Add welcome message with context
          const contextInfo = [];
          if (summary?.keyPoints?.length > 0) {
            contextInfo.push(`📝 ${summary.keyPoints.length} key points from the meeting`);
          }
          if (actionItems?.length > 0) {
            contextInfo.push(`✅ ${actionItems.length} action items identified`);
          }
          if (transcript.wordCount) {
            contextInfo.push(`📊 ${transcript.wordCount} words transcribed`);
          }

          const welcomeMessage = {
            role: 'assistant',
            content: `Hi! I'm MeetIQ, your AI meeting assistant. I've analyzed your meeting and I'm ready to answer any questions!\n\n${contextInfo.join('\n')}\n\nWhat would you like to know about this meeting?`,
          };
          setMessages([welcomeMessage]);
          console.log('✅ Welcome message added');
        } else {
          console.log('❌ Conversation creation failed:', result.error);
          setError(`Failed to create conversation: ${result.error}`);
        }
      } catch (err) {
        console.error('❌ Error initializing chat:', err);
        setError(`Failed to initialize chat: ${err.message}`);
      }
    };

    initializeChat();
  }, [user, transcriptId, transcript, summary, actionItems]);

  const handleSendMessage = async () => {
    console.log('🔵 handleSendMessage called');
    console.log('Input:', input);
    console.log('isLoading:', isLoading);
    console.log('conversationId:', conversationId);
    
    if (!input.trim()) {
      console.log('❌ Input is empty');
      return;
    }
    
    if (isLoading) {
      console.log('❌ Already loading');
      return;
    }
    
    if (!conversationId) {
      console.log('❌ No conversation ID');
      setError('Conversation not initialized. Please refresh the page.');
      return;
    }

    const userMessage = {
      role: 'user',
      content: input.trim(),
    };

    console.log('✅ Adding user message to UI:', userMessage);
    
    // Add user message to UI
    setMessages(prev => {
      console.log('Previous messages:', prev);
      const newMessages = [...prev, userMessage];
      console.log('New messages:', newMessages);
      return newMessages;
    });
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      console.log('💾 Saving user message to Firestore...');
      // Save user message to Firestore
      await addMessage(conversationId, userMessage);
      console.log('✅ User message saved');

      // Get answer using RAG
      const userId = user.uid || user.id;
      const activeTranscriptId = transcriptId || transcript.id?.toString();
      console.log('🤖 Getting answer from RAG...');
      console.log('User ID:', userId);
      console.log('Transcript ID:', activeTranscriptId);
      
      const result = await answerQuestion(
        userId,
        activeTranscriptId,
        userMessage.content,
        messages
      );

      console.log('RAG Result:', result);

      if (result.success) {
        const assistantMessage = {
          role: 'assistant',
          content: result.answer,
          sources: result.sources,
        };

        console.log('✅ Adding assistant message to UI:', assistantMessage);
        
        // Add assistant message to UI
        setMessages(prev => [...prev, assistantMessage]);

        // Save assistant message to Firestore
        await addMessage(conversationId, assistantMessage);
        console.log('✅ Assistant message saved');
      } else {
        throw new Error(result.error || 'Failed to get answer');
      }
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError('Failed to get answer. Please try again.');
      
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try asking your question again.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
      console.log('🏁 handleSendMessage finished');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Loading state while indexing
  if (isIndexing) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-cyan-500 animate-spin mx-auto" />
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Preparing Your Meeting for Chat
            </h3>
            <p className="text-gray-400">
              Indexing transcript for intelligent conversations... This may take a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !transcript) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Unable to Start Chat
            </h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg flex flex-col">
      {/* Header */}
      <header className="bg-primary-surface border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-primary-hover rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Chat with MeetIQ</h1>
                <p className="text-sm text-gray-400">
                  {transcript?.filename || 'Meeting Assistant'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-6 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {/* Message bubble */}
                  <div
                    className={`rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-white ml-auto'
                        : 'bg-gray-800/50 text-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {message.role === 'assistant' && (
                        <Sparkles className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        
                        {/* Show sources if available */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-700/50">
                            <p className="text-xs text-gray-400 mb-2 font-medium">
                              📚 Sources from meeting:
                            </p>
                            <div className="space-y-2">
                              {message.sources.map((source, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs text-gray-500 bg-gray-900/30 rounded-lg p-2"
                                >
                                  {source.text}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 flex justify-start"
            >
              <div className="bg-gray-800/50 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  <span className="text-sm text-gray-400">MeetIQ is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error message */}
          {error && transcript && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 flex justify-center"
            >
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="bg-primary-surface border-t border-gray-800 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your meeting..."
                disabled={isLoading || !isIndexed}
                rows={1}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none max-h-32"
                style={{ minHeight: '48px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || !isIndexed}
              className="p-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

// Made with Bob