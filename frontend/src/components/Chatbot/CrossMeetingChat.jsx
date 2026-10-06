import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Database, 
  Clock, 
  ExternalLink, 
  ChevronRight,
  MessageSquare,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { askCrossMeetingMemory } from '../../services/meetsightApi';

const SUGGESTED_QUERIES = [
  "What did we decide about authentication?",
  "Who is responsible for the database and containers?",
  "When is the backend scheduled for deployment?",
  "What was the blocker regarding AWS credits?"
];

const CrossMeetingChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      text: "Hello! I am your MeetSight Contextual Memory Agent. I can answer questions across your current and historical meetings by searching through Qdrant vector memory. Ask me anything!",
      citations: []
    }
  ]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || query;
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await askCrossMeetingMemory(text);
      const agentMsg = {
        id: Date.now() + 1,
        sender: 'agent',
        text: response.answer || "I could not find an answer in vector memory.",
        citations: response.citations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'agent',
        text: `Sorry, I encountered an error searching memory: ${err.message}`,
        citations: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#0e142e]/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-xl flex flex-col h-[580px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 shadow-lg shadow-purple-500/10">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Cross-Meeting Memory Assistant</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Database className="w-2.5 h-2.5" />
                Qdrant Powered
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Answers queries using semantic search across all historical meeting records
            </p>
          </div>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
              }`}
            >
              {msg.sender === 'agent' && (
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-purple-400 mb-1.5">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>MeetSight Memory Agent</span>
                </div>
              )}
              <div className="whitespace-pre-line font-sans">{msg.text}</div>

              {/* Citations Box */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    <span>Memory Citations from Qdrant:</span>
                  </div>
                  <div className="space-y-1.5">
                    {msg.citations.map((c, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 text-[11px] flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="font-semibold text-cyan-300">
                            Doc {c.doc_id}: {c.meeting_title}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-400">
                            Score: {c.similarity_score}
                          </span>
                        </div>
                        <p className="text-slate-300 italic">"{c.text_snippet}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {msg.timestamp && (
              <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-purple-300 flex items-center gap-2">
              <Bot className="w-4 h-4 animate-spin text-purple-400" />
              <span>Querying Qdrant persistent vector memory & synthesizing answer...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Queries */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">Try:</span>
        {SUGGESTED_QUERIES.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(sq)}
            disabled={isLoading}
            className="text-[11px] bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-purple-500/40 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shrink-0"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about past or current meetings..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default CrossMeetingChat;
