import { useState } from 'react';
import { Send } from 'lucide-react';
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
      text: "Hello! I am your MeetSight contextual memory assistant. I can query across your current and historical meetings using Qdrant vector memory. Ask me anything about past decisions, assignments, or blockers.",
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
        text: `Sorry, an error occurred while searching memory: ${err.message}`,
        citations: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-surface border border-line rounded-xl shadow-xl dark:shadow-none flex flex-col h-[580px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-line bg-surface flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint">
              Memory Q&A
            </h3>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Cross-meeting semantic retrieval via Qdrant vector memory
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-ink-muted">
          <span className="w-2 h-2 rounded-full bg-sage" />
          <span>Vector index ready</span>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* User message: right-aligned in raised with ink text */}
            {msg.sender === 'user' ? (
              <div className="max-w-[80%] rounded-lg p-3.5 text-sm leading-relaxed bg-raised text-ink border border-line">
                <div className="whitespace-pre-line">{msg.text}</div>
              </div>
            ) : (
              /* Assistant message: left-aligned on surface with a 2px accent left border */
              <div className="max-w-[80%] rounded-lg p-3.5 text-sm leading-relaxed bg-surface text-ink border border-line border-l-2 border-l-accent shadow-sm dark:shadow-none space-y-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                  MeetSight Assistant
                </div>
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Citations as small accent-soft chips with meeting name and timestamp */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-line space-y-1.5">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-ink-faint block">
                      Sources:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col gap-0.5 p-2 rounded-md bg-accent-soft border border-accent/20 text-ink"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-accent">
                              {c.meeting_title || 'Sprint Sync'}
                            </span>
                            <span className="text-[11px] font-mono tabular-nums text-ink-muted">
                              score {c.similarity_score}
                            </span>
                          </div>
                          {c.text_snippet && (
                            <p className="font-serif italic text-xs text-ink-muted line-clamp-2">
                              "{c.text_snippet}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {msg.timestamp && (
              <span className="text-[10px] text-ink-faint font-mono tabular-nums mt-1 px-1">{msg.timestamp}</span>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start">
            <div className="bg-surface border border-line border-l-2 border-l-accent rounded-lg p-3.5 text-xs text-ink-muted flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Querying vector memory and synthesizing response...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Queries */}
      <div className="px-4 py-2 bg-raised border-t border-line overflow-x-auto flex items-center gap-2 scrollbar-none">
        <span className="text-[11px] font-medium text-ink-muted uppercase tracking-wider shrink-0">Try:</span>
        {SUGGESTED_QUERIES.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(sq)}
            disabled={isLoading}
            className="text-xs bg-surface hover:bg-raised text-ink-muted hover:text-ink border border-line px-2.5 py-1 rounded transition-colors duration-150 whitespace-nowrap shrink-0"
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
        className="p-3 border-t border-line bg-surface flex items-center gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question across all meeting memories..."
          className="flex-1 bg-surface border border-line rounded-md px-3.5 py-2 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="p-2 rounded-md bg-accent text-accent-ink hover:bg-accent-hover transition-colors duration-150 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-canvas flex-shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default CrossMeetingChat;
