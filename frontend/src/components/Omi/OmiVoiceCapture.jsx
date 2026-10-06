import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Square, 
  Radio, 
  Copy, 
  Check, 
  Sparkles, 
  Volume2, 
  HelpCircle,
  Play
} from 'lucide-react';

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
          onAudioUploaded(audioFile, 'Live Voice Capture (Omi Mode)');
        }
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone permission is required to capture live voice. Please enable microphone permissions in your browser.');
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

  const handleSimulateSample = (sample) => {
    if (onTranscriptReady) {
      onTranscriptReady(sample.text, sample.title);
    }
  };

  return (
    <div className="w-full bg-[#0c122b]/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Omi Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center relative shadow-lg shadow-cyan-500/10">
            <Radio className="w-6 h-6 text-cyan-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-white">Omi Ambient Voice Capture</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Voice-First
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Stream live ambient conversations directly into Lyzr multi-agent reasoning DAG
            </p>
          </div>
        </div>

        {/* Center: Record / Listening Trigger */}
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={startRecording}
              disabled={isProcessing}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              <Mic className="w-4 h-4 text-white" />
              <span>Start Live Voice Capture</span>
            </motion.button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-mono font-bold animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>REC {formatTimer(recordingTime)}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={stopRecording}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-semibold text-xs shadow-lg shadow-red-500/20 transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Finish & Analyze</span>
              </motion.button>
            </div>
          )}

          {/* Quick Demo Simulator Button */}
          <div className="relative group">
            <button
              onClick={() => handleSimulateSample(SAMPLE_TRANSCRIPTS[0])}
              disabled={isProcessing || isRecording}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 font-medium transition-all disabled:opacity-50"
              title="Test the complete pipeline with a realistic meeting transcript"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Sample</span>
            </button>
          </div>

          {/* Omi Device Webhook Info */}
          <button
            onClick={() => setShowOmiModal(true)}
            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-slate-200 transition-colors"
            title="Omi Hardware Webhook Details"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Omi Device Webhook Details Modal */}
      <AnimatePresence>
        {showOmiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0e1533] border border-slate-800 rounded-2xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Radio className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Physical Omi Hardware Integration</h3>
                </div>
                <button
                  onClick={() => setShowOmiModal(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs text-slate-300">
                <p>
                  MeetSight provides a dedicated ingestion endpoint for the <strong>Omi necklace / wearable microphone</strong>. When configured in the Omi mobile app, ambient conversations are streamed directly to this backend:
                </p>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px]">
                  <div className="text-slate-400 mb-1">Webhook URL (Omi App Developer Settings):</div>
                  <div className="flex items-center justify-between gap-2 text-cyan-300">
                    <span className="truncate">{webhookUrl}</span>
                    <button
                      onClick={copyWebhook}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-200">
                  <p className="font-semibold text-cyan-300 mb-1">Browser Companion Mode:</p>
                  If you do not have an Omi physical wearable attached right now, use the <strong>"Start Live Voice Capture"</strong> button above or <strong>"Demo Sample"</strong> to trigger the complete agentic pipeline live!
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OmiVoiceCapture;
