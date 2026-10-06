import { createContext, useContext, useState, useEffect } from 'react';

const TranscriptContext = createContext();

export const useTranscript = () => {
  const context = useContext(TranscriptContext);
  if (!context) {
    throw new Error('useTranscript must be used within TranscriptProvider');
  }
  return context;
};

export const TranscriptProvider = ({ children }) => {
  // Initialize from localStorage if available
  const [transcript, setTranscriptState] = useState(() => {
    const saved = localStorage.getItem('meetiq_transcript');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [transcriptId, setTranscriptIdState] = useState(() => {
    return localStorage.getItem('meetiq_transcript_id') || null;
  });
  
  const [summary, setSummaryState] = useState(() => {
    const saved = localStorage.getItem('meetiq_summary');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [actionItems, setActionItemsState] = useState(() => {
    const saved = localStorage.getItem('meetiq_action_items');
    return saved ? JSON.parse(saved) : null;
  });

  // Wrapper functions that also save to localStorage
  const setTranscript = (value) => {
    setTranscriptState(value);
    if (value) {
      localStorage.setItem('meetiq_transcript', JSON.stringify(value));
    } else {
      localStorage.removeItem('meetiq_transcript');
    }
  };

  const setTranscriptId = (value) => {
    setTranscriptIdState(value);
    if (value) {
      localStorage.setItem('meetiq_transcript_id', value);
    } else {
      localStorage.removeItem('meetiq_transcript_id');
    }
  };

  const setSummary = (value) => {
    setSummaryState(value);
    if (value) {
      localStorage.setItem('meetiq_summary', JSON.stringify(value));
    } else {
      localStorage.removeItem('meetiq_summary');
    }
  };

  const setActionItems = (value) => {
    setActionItemsState(value);
    if (value) {
      localStorage.setItem('meetiq_action_items', JSON.stringify(value));
    } else {
      localStorage.removeItem('meetiq_action_items');
    }
  };

  const value = {
    transcript,
    setTranscript,
    transcriptId,
    setTranscriptId,
    summary,
    setSummary,
    actionItems,
    setActionItems,
  };

  return (
    <TranscriptContext.Provider value={value}>
      {children}
    </TranscriptContext.Provider>
  );
};

// Made with Bob