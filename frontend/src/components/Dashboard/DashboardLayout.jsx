import { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import MeetingHeader from './MeetingHeader';
import AudioUpload from '../Upload/AudioUpload';
import TranscriptViewer from '../Transcript/TranscriptViewer';
import SummaryCards from '../Summary/SummaryCards';
import AgentDAGVisualizer from '../AgentVisualizer/AgentDAGVisualizer';
import OmiVoiceCapture from '../Omi/OmiVoiceCapture';
import DecisionsPanel from '../Decisions/DecisionsPanel';
import RisksPanel from '../Risks/RisksPanel';
import ActionItemsPanel from '../ActionItems/ActionItemsPanel';
import MemoryExplorerModal from '../Memory/MemoryExplorerModal';
import ProcessingModal from '../UI/ProcessingModal';
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
  const [processingFileTitle, setProcessingFileTitle] = useState('Meeting Audio');
  const [agentStates, setAgentStates] = useState({});
  const [isMemoryExplorerOpen, setIsMemoryExplorerOpen] = useState(false);

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
    setProcessingFileTitle(title || 'Sprint Architecture & Infrastructure Sync');
    setIsLoading(true);
    setAgentStates({});
    
    try {
      const result = await processMeetingTranscript(transcriptText, title);
      const meeting = result.meeting;

      setTranscript({
        id: meeting.id,
        filename: title || 'Sprint Architecture & Infrastructure Sync',
        text: transcriptText,
        duration: meeting.duration || '42m 18s',
        wordCount: transcriptText.split(/\s+/).length,
        status: 'completed',
        uploadDate: new Date().toISOString()
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
    setProcessingFileTitle(file?.name || title || 'Audio Recording');
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
        uploadDate: new Date().toISOString()
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
    <div className="min-h-screen bg-canvas text-ink">
      {/* 1. Header: sticky, surface background, 1px line border bottom */}
      <DashboardHeader
        transcript={transcript}
        summary={summary}
        actionItems={actionItems}
        onLoadTranscript={handleLoadTranscript}
        onOpenMemoryExplorer={() => setIsMemoryExplorerOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 2. Meeting Header: 28px serif title, metadata with dot separators, overlapping participant avatars */}
        <MeetingHeader transcript={transcript} />

        {/* 3. Capture bar: surface card with left accent bar (3px) */}
        <OmiVoiceCapture
          onAudioUploaded={handleAudioUpload}
          onTranscriptReady={handleProcessTranscript}
          isProcessing={isLoading}
        />

        {/* 4. Workspace: 8-col left, 4-col pipeline right. Below lg, pipeline moves above summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 of 12 columns on lg): Summary, Decisions, Action items, Risks, Transcript, Upload */}
          <div className="order-2 lg:order-1 lg:col-span-8 space-y-8 min-w-0">
            {/* 1. Summary card */}
            <SummaryCards
              summary={summary}
              isLoading={isLoading}
            />

            {/* 2. Decisions */}
            <DecisionsPanel decisions={decisions} />

            {/* 3. Action items */}
            <ActionItemsPanel actionItems={actionItems} isLoading={isLoading} />

            {/* 4. Risks & Blockers */}
            <RisksPanel risks={risks} />

            {/* Transcript Viewer */}
            <TranscriptViewer
              transcript={transcript}
              isLoading={isLoading}
            />

            {/* Audio Upload */}
            <AudioUpload
              onFileUpload={(file) => handleAudioUpload(file, `Meeting: ${file.name}`)}
            />
          </div>

          {/* Right Column (4 of 12 columns on lg): Agent pipeline, sticky on desktop */}
          <div className="order-1 lg:order-2 lg:col-span-4 min-w-0">
            <div className="lg:sticky lg:top-24">
              <AgentDAGVisualizer
                agentStates={agentStates}
                isProcessing={isLoading}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Memory Explorer Modal */}
      <MemoryExplorerModal
        isOpen={isMemoryExplorerOpen}
        onClose={() => setIsMemoryExplorerOpen(false)}
      />

      {/* 5-Agent Processing & Groq Rate Pacing Patience Modal */}
      <ProcessingModal
        isOpen={isLoading}
        filename={processingFileTitle}
      />
    </div>
  );
};

export default DashboardLayout;
