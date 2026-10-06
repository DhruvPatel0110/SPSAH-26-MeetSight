import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardHeader from './DashboardHeader';
import AudioUpload from '../Upload/AudioUpload';
import TranscriptViewer from '../Transcript/TranscriptViewer';
import SummaryCards from '../Summary/SummaryCards';
import AgentDAGVisualizer from '../AgentVisualizer/AgentDAGVisualizer';
import OmiVoiceCapture from '../Omi/OmiVoiceCapture';
import DecisionsPanel from '../Decisions/DecisionsPanel';
import RisksPanel from '../Risks/RisksPanel';
import MemoryExplorerModal from '../Memory/MemoryExplorerModal';
import CrossMeetingChat from '../Chatbot/CrossMeetingChat';
import { 
  uploadMeetingAudio, 
  processMeetingTranscript, 
  subscribeToAgentStream 
} from '../../services/meetsightApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTranscript } from '../../contexts/TranscriptContext';

const DashboardLayout = () => {
  const { user } = useAuth();
  const {
    transcript,
    setTranscript,
    setTranscriptId,
    summary,
    setSummary,
    actionItems,
    setActionItems
  } = useTranscript();
  
  const [decisions, setDecisions] = useState([]);
  const [risks, setRisks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agentStates, setAgentStates] = useState({});
  const [isMemoryExplorerOpen, setIsMemoryExplorerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('insights'); // 'insights' | 'chat'

  // Connect to live Lyzr Agent Execution WebSocket stream
  useEffect(() => {
    const unsubscribe = subscribeToAgentStream((event) => {
      if (event.agent_id) {
        setAgentStates((prev) => ({
          ...prev,
          [event.agent_id]: {
            status: event.status,
            thought: event.thought,
            data: event.data,
            timestamp: event.timestamp
          }
        }));
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleProcessTranscript = async (transcriptText, title) => {
    setIsLoading(true);
    // Reset agent states to trigger fresh visual DAG
    setAgentStates({});
    
    try {
      const result = await processMeetingTranscript(transcriptText, title);
      const meeting = result.meeting;

      setTranscript({
        id: meeting.id,
        filename: title || 'Ambient Voice Session',
        text: transcriptText,
        duration: meeting.duration || 'N/A',
        wordCount: transcriptText.split(/\s+/).length,
        status: 'completed',
        uploadDate: new Date().toISOString().split('T')[0]
      });
      setTranscriptId(meeting.id);

      if (meeting.summary) {
        setSummary({
          keyPoints: meeting.summary.key_points || [],
          sentiment: meeting.summary.sentiment || 'Constructive',
          topics: meeting.summary.topics || [],
          overview: meeting.summary.overview || ''
        });
      }

      if (meeting.decisions) {
        setDecisions(meeting.decisions);
      }

      if (meeting.action_items) {
        setActionItems(meeting.action_items);
      }

      if (meeting.risks) {
        setRisks(meeting.risks);
      }
    } catch (err) {
      console.error('Error processing transcript:', err);
      alert(`Error processing meeting: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioUpload = async (file, title) => {
    setIsLoading(true);
    setAgentStates({});

    try {
      const result = await uploadMeetingAudio(file, title);
      const meeting = result.meeting;
      const transcription = result.transcription;

      setTranscript({
        id: meeting.id,
        filename: file.name,
        text: transcription.text,
        duration: meeting.duration || `${Math.round(transcription.duration || 0)}s`,
        wordCount: transcription.text.split(/\s+/).length,
        status: 'completed',
        uploadDate: new Date().toISOString().split('T')[0]
      });
      setTranscriptId(meeting.id);

      if (meeting.summary) {
        setSummary({
          keyPoints: meeting.summary.key_points || [],
          sentiment: meeting.summary.sentiment || 'Constructive',
          topics: meeting.summary.topics || [],
          overview: meeting.summary.overview || ''
        });
      }

      if (meeting.decisions) {
        setDecisions(meeting.decisions);
      }

      if (meeting.action_items) {
        setActionItems(meeting.action_items);
      }

      if (meeting.risks) {
        setRisks(meeting.risks);
      }
    } catch (err) {
      console.error('Error uploading audio:', err);
      alert(`Audio processing failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadTranscript = (saved) => {
    setTranscript({
      id: saved.id,
      filename: saved.filename,
      duration: saved.duration,
      uploadDate: saved.uploadDate,
      status: saved.status,
      text: saved.text,
      wordCount: saved.wordCount
    });
    if (saved.summary) setSummary(saved.summary);
    if (saved.actionItems) setActionItems(saved.actionItems);
    if (saved.decisions) setDecisions(saved.decisions);
    if (saved.risks) setRisks(saved.risks);
  };

  return (
    <div className="min-h-screen bg-primary-bg text-text-primary">
      {/* Header */}
      <DashboardHeader
        transcript={transcript}
        summary={summary}
        actionItems={actionItems}
        onLoadTranscript={handleLoadTranscript}
        onOpenMemoryExplorer={() => setIsMemoryExplorerOpen(true)}
      />

      <main className="max-w-[1920px] mx-auto px-6 sm:px-8 py-8">
        <div className="flex flex-col gap-8 w-full">
          
          {/* SECTION 1: Omi Voice Capture & Ambient Ingestion */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <OmiVoiceCapture
              onAudioUploaded={handleAudioUpload}
              onTranscriptReady={handleProcessTranscript}
              isProcessing={isLoading}
            />
          </motion.section>

          {/* SECTION 2: Lyzr Observable Multi-Agent DAG Visualizer */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full"
          >
            <AgentDAGVisualizer
              agentStates={agentStates}
              isProcessing={isLoading}
            />
          </motion.section>

          {/* SECTION 3: Tab Navigation (Insights vs Cross-Meeting Memory Q&A) */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'insights'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Meeting Intelligence & Actions
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cross-Meeting Memory Chatbot
            </button>
          </div>

          {activeTab === 'chat' ? (
            /* TAB: Cross-Meeting Conversational Chatbot */
            <motion.section
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <CrossMeetingChat />
            </motion.section>
          ) : (
            /* TAB: Meeting Intelligence Dashboard */
            <>
              {/* Row: Confirmed Decisions & Action Items */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                <DecisionsPanel decisions={decisions} />
                <RisksPanel risks={risks} />
              </div>

              {/* AI Summary Cards (Executive Brief & Key Points) */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="w-full"
              >
                <SummaryCards
                  summary={summary}
                  isLoading={isLoading}
                />
              </motion.section>

              {/* Transcript Viewer with Search & Copy */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="w-full"
              >
                <TranscriptViewer
                  transcript={transcript}
                  isLoading={isLoading}
                />
              </motion.section>

              {/* Fallback File Drop Uploader */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="w-full pt-4 border-t border-slate-800/80"
              >
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Upload Recorded Audio File (Alternative to Live Voice)
                </div>
                <AudioUpload onFileUpload={(file) => handleAudioUpload(file, `Meeting: ${file.name}`)} />
              </motion.section>
            </>
          )}

        </div>
      </main>

      {/* Qdrant Persistent Memory Explorer Modal */}
      <MemoryExplorerModal
        isOpen={isMemoryExplorerOpen}
        onClose={() => setIsMemoryExplorerOpen(false)}
      />

      {/* Background Ambient Lighting */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default DashboardLayout;
