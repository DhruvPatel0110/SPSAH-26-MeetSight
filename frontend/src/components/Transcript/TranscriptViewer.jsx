import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Copy, Search, Check } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { SkeletonTranscript } from '../UI/Skeleton';

const TranscriptViewer = ({ transcript, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript?.text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightText = (text, search) => {
    if (!search.trim()) return text;
    
    const regex = new RegExp(`(${search})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-accent-cyan/30 text-text-primary rounded px-1">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-purple/10 rounded-lg">
            <FileText className="w-6 h-6 text-accent-purple" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gradient">Transcript</h2>
            {transcript && (
              <p className="text-sm text-text-secondary">
                {transcript.wordCount} words • {transcript.duration}
              </p>
            )}
          </div>
        </div>
        
        {transcript && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            icon={copied ? Check : Copy}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        )}
      </div>

      {/* Search Bar */}
      {transcript && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search in transcript..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-primary-hover border border-accent-cyan/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-cyan transition-colors"
          />
        </div>
      )}

      {/* Transcript Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <SkeletonTranscript />
        ) : transcript ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="prose prose-invert max-w-none"
          >
            <div className="text-text-primary leading-relaxed whitespace-pre-wrap">
              {highlightText(transcript.text, searchTerm)}
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="p-4 bg-accent-purple/10 rounded-full mb-4">
              <FileText className="w-12 h-12 text-accent-purple" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No Transcript Available
            </h3>
            <p className="text-text-secondary">
              Upload an audio file to generate a transcript
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {transcript && (
        <div className="mt-4 pt-4 border-t border-accent-cyan/20">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-text-secondary">
                Uploaded: {new Date(transcript.uploadDate).toLocaleDateString()}
              </span>
              {transcript.speakers && (
                <span className="text-text-secondary">
                  Speakers: {transcript.speakers.join(', ')}
                </span>
              )}
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              transcript.status === 'completed' 
                ? 'bg-status-success/20 text-status-success' 
                : 'bg-status-warning/20 text-status-warning'
            }`}>
              {transcript.status}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TranscriptViewer;
