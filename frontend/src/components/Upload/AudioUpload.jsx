import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import Card from '../UI/Card';
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
    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
      alert('Please upload a valid audio file (MP3, WAV, M4A, OGG)');
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('File size must be less than 100MB');
      return;
    }

    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setUploadedFile(file);
      setIsUploading(false);
      if (onFileUpload) {
        onFileUpload(file);
      }
    }, 1500);
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
    <Card className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-accent-cyan/10 rounded-lg">
          <Upload className="w-6 h-6 text-accent-cyan" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Upload Audio</h2>
      </div>

      {!uploadedFile ? (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          animate={{
            borderColor: isDragging ? '#60a5fa' : 'rgba(96, 165, 250, 0.3)',
            backgroundColor: isDragging ? 'rgba(96, 165, 250, 0.1)' : 'transparent'
          }}
          className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all flex-1 flex flex-col items-center justify-center"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <motion.div
            animate={{ scale: isDragging ? 1.1 : 1 }}
            className="inline-block p-4 bg-accent-cyan/10 rounded-full mb-4"
          >
            <Upload className="w-12 h-12 text-accent-cyan" />
          </motion.div>
          
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {isDragging ? 'Drop your file here' : 'Drag & drop your audio file'}
          </h3>
          <p className="text-text-secondary mb-4">
            or click to browse
          </p>
          <p className="text-sm text-text-muted">
            Supports: MP3, WAV, M4A, OGG (Max 100MB)
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-start gap-4 p-5 bg-primary-hover rounded-lg border border-accent-cyan/30">
            <div className="p-3 bg-accent-cyan/10 rounded-lg">
              <File className="w-6 h-6 text-accent-cyan" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-text-primary truncate">
                    {uploadedFile.name}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {formatFileSize(uploadedFile.size)}
                  </p>
                </div>
                <button
                  onClick={removeFile}
                  className="text-text-secondary hover:text-status-error transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {isUploading ? (
                <div className="mt-3">
                  <div className="h-2 bg-primary-surface rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple"
                    />
                  </div>
                  <p className="text-sm text-text-secondary mt-2">Uploading...</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-2 text-status-success">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Upload complete</span>
                </div>
              )}
            </div>
          </div>
          
          <Button 
            variant="secondary" 
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            Upload Different File
          </Button>
        </motion.div>
      )}
    </Card>
  );
};

export default AudioUpload;
