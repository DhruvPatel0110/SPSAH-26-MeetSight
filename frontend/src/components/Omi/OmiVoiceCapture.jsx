import { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  HelpCircle,
  Copy, 
  Check
} from 'lucide-react';
import Modal from '../UI/Modal';

const SAMPLE_TRANSCRIPTS = [
  {
    title: 'Product & Architecture Sprint Sync',
    text: `Rahul: Welcome everyone to today's Sprint Architecture sync. First item on the agenda: in our previous sprint review we evaluated both JWT and OAuth2, and today we officially confirm that we will adopt OAuth2 with Google and GitHub providers for user authentication. 
Sarah: Sounds great. I will finalize the OAuth callback flows and refresh token rotation logic by Thursday.
Rahul: Perfect. Now regarding the backend deployment: we have committed to deploying the core FastAPI microservices to AWS Elastic Container Service by this Friday.
Alex: I am assigned to set up the production PostgreSQL database, write the migration scripts, and configure the Docker containers. I will have that ready by Wednesday evening.
Rahul: Excellent. Please keep in mind the major blocker: AWS credit approval is still pending with finance. If it is delayed past Wednesday, we might need to stage on our backup Render cluster to prevent schedule slip. Let's make sure Sarah and Alex coordinate on schema contracts by tomorrow noon.`
  },
  {
    title: 'Q4 AI Agent Infrastructure Strategy',
    text: `David: Today we are aligning on our autonomous agent infrastructure for Q4. We agreed to standardize on Lyzr for all agentic reasoning and DAG workflows rather than maintaining custom prompt chains.
Elena: That will save us weeks of orchestration boilerplate. I will build the decision engine and action extractor agents using Lyzr by next Monday.
Marcus: Regarding vector memory: we decided to adopt Qdrant for persistent vector search across all meeting transcripts and knowledge bases. Qdrant's payload filtering and fast cosine search give us the exact low-latency retrieval we need for cross-meeting recall.
David: Action item for Marcus: provision the Qdrant cluster and configure 384-dimensional dense vector embeddings by Friday. Any risks?
Elena: Risk of rate limits on LLM inference if we run multiple concurrent DAGs. We should add client-side batching and fallback to Groq or local models if quotas are reached.`
  }
];

const OmiVoiceCapture = ({ onAudioUploaded, onTranscriptReady, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showOmiModal, setShowOmiModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const webhookUrl = 'http://localhost:8000/api/omi/webhook';

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `omi_live_recording_${Date.now()}.webm`, {
          type: 'audio/webm',
        });
        if (onAudioUploaded) {
          onAudioUploaded(audioFile, 'Live Voice Capture');
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone permission is required to capture live voice. Please enable microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateSample = () => {
    if (onTranscriptReady) {
      onTranscriptReady(SAMPLE_TRANSCRIPTS[0].text, SAMPLE_TRANSCRIPTS[0].title);
    }
  };

  return (
    <div className="w-full bg-surface border border-line rounded-lg p-6 shadow-sm dark:shadow-none border-l-[3px] border-l-accent">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Section title & helper text */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint">
              Voice capture
            </span>
          </div>
          <p className="text-sm text-ink-muted">
            Stream ambient audio directly into the multi-agent pipeline or load a demo session.
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-start sm:justify-end">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-ink hover:bg-accent-hover text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-canvas"
            >
              <Mic className="w-4 h-4" />
              <span>Start live capture</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-raised border border-line text-xs font-mono tabular-nums text-ink">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span>{formatTimer(recordingTime)}</span>
              </span>
              <button
                onClick={stopRecording}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-accent text-accent-ink hover:bg-accent-hover text-sm font-medium transition-colors duration-150 ring-2 ring-accent ring-offset-2 ring-offset-canvas animate-pulse focus:outline-none"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop capture</span>
              </button>
            </div>
          )}

          <button
            onClick={handleSimulateSample}
            disabled={isProcessing || isRecording}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-line bg-surface hover:bg-raised text-ink text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-canvas"
          >
            Load demo
          </button>

          {/* Help icon ghost button */}
          <button
            onClick={() => setShowOmiModal(true)}
            className="p-2 rounded-md text-ink-faint hover:text-ink hover:bg-raised transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-canvas"
            title="Voice capture & hardware integration details"
            aria-label="Voice capture help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Help Modal */}
      <Modal
        isOpen={showOmiModal}
        onClose={() => setShowOmiModal(false)}
        title="Voice Capture Details"
        size="md"
      >
        <div className="space-y-4 text-sm text-ink">
          <p className="text-ink-muted leading-relaxed">
            MeetSight ingests live audio streams from your browser microphone or physical wearable devices such as the Omi pendant. Ingested streams are transcribed and dispatched to the multi-agent reasoning DAG.
          </p>

          <div className="p-3.5 bg-raised border border-line rounded-lg">
            <div className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint mb-1.5">
              Webhook Endpoint (Omi App)
            </div>
            <div className="flex items-center justify-between gap-2 font-mono text-xs text-ink">
              <span className="truncate select-all">{webhookUrl}</span>
              <button
                onClick={copyWebhook}
                className="p-1 rounded text-ink-muted hover:text-ink transition-colors flex-shrink-0"
                title="Copy webhook URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-sage" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-raised border border-line rounded-lg text-xs text-ink-muted leading-relaxed">
            <span className="font-semibold text-ink">Browser Companion Mode:</span> If no physical wearable is connected, click <strong className="text-ink">"Start live capture"</strong> to record from your system mic, or <strong className="text-ink">"Load demo"</strong> to run analysis on sample transcripts.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OmiVoiceCapture;
