import { useState, useRef } from 'react';
import { Upload, File, X, Check } from 'lucide-react';
import Button from '../UI/Button';

const AudioUpload = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
      alert('Please upload a valid audio file (MP3, WAV, M4A, OGG)');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      alert('File size must be less than 100MB');
      return;
    }

    setIsUploading(true);
    
    setTimeout(() => {
      setUploadedFile(file);
      setIsUploading(false);
      if (onFileUpload) {
        onFileUpload(file);
      }
    }, 1200);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <section className="bg-surface border border-line rounded-lg p-6 shadow-sm dark:shadow-none space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-ink-faint" />
        <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint">
          Audio Upload
        </h3>
      </div>

      {!uploadedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-150 ${
            isDragging
              ? 'border-accent bg-raised'
              : 'border-line hover:border-ink-faint hover:bg-raised/50 bg-surface'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Upload className="w-7 h-7 text-ink-faint mx-auto mb-2" />
          
          <p className="text-sm font-medium text-ink">
            {isDragging ? 'Drop audio file here' : 'Drop recorded file or click to browse'}
          </p>
          <p className="text-xs text-ink-muted mt-1 font-mono tabular-nums">
            MP3, WAV, M4A, OGG (Max 100MB)
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-raised rounded-lg border border-line">
            <File className="w-5 h-5 text-ink-muted flex-shrink-0 mt-0.5" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-ink truncate">
                    {uploadedFile.name}
                  </h4>
                  <p className="text-xs text-ink-muted font-mono tabular-nums">
                    {formatFileSize(uploadedFile.size)}
                  </p>
                </div>
                <button
                  onClick={removeFile}
                  className="text-ink-muted hover:text-rose transition-colors duration-150 p-1"
                  aria-label="Remove uploaded file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {isUploading ? (
                <div className="mt-3">
                  <div className="h-1 bg-line rounded-full overflow-hidden">
                    <div className="h-full bg-accent animate-pulse w-3/4" />
                  </div>
                  <p className="text-xs text-ink-muted mt-1.5">Uploading...</p>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-2 text-sage text-xs font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Upload complete</span>
                </div>
              )}
            </div>
          </div>
          
          <Button 
            variant="secondary" 
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-xs"
          >
            Upload a different file
          </Button>
        </div>
      )}
    </section>
  );
};

export default AudioUpload;
