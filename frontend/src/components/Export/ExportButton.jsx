import { useState } from 'react';
import { Download, FileText, FileJson, FileCode } from 'lucide-react';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import { exportAsText, exportAsPDF, exportAsJSON, exportAsMarkdown } from '../../utils/exportHelpers';

const ExportButton = ({ transcript, summary, actionItems }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState({
    transcript: true,
    summary: true,
    actionItems: true
  });

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF Document',
      description: 'Professional PDF format (.pdf)',
      icon: FileText,
      color: 'text-status-error',
      handler: exportAsPDF
    },
    {
      id: 'txt',
      name: 'Text File',
      description: 'Plain text format (.txt)',
      icon: FileText,
      color: 'text-accent-cyan',
      handler: exportAsText
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'Structured data format (.json)',
      icon: FileJson,
      color: 'text-accent-purple',
      handler: exportAsJSON
    },
    {
      id: 'md',
      name: 'Markdown',
      description: 'Markdown format (.md)',
      icon: FileCode,
      color: 'text-accent-pink',
      handler: exportAsMarkdown
    }
  ];

  const handleExport = (format) => {
    const dataToExport = {
      transcript: selectedFormats.transcript ? transcript : null,
      summary: selectedFormats.summary ? summary : null,
      actionItems: selectedFormats.actionItems ? actionItems : null
    };

    format.handler(
      dataToExport.transcript,
      dataToExport.summary,
      dataToExport.actionItems
    );

    setIsModalOpen(false);
  };

  const toggleFormat = (key) => {
    setSelectedFormats(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const hasData = transcript || summary || actionItems;

  return (
    <>
      <Button
        variant="secondary"
        icon={Download}
        onClick={() => setIsModalOpen(true)}
        disabled={!hasData}
      >
        Export
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Export Data"
        size="lg"
      >
        <div className="p-6 space-y-6">
          {/* Content Selection */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              Select Content to Export
            </h3>
            <div className="space-y-2">
              {[
                { key: 'transcript', label: 'Transcript', available: !!transcript },
                { key: 'summary', label: 'Summary', available: !!summary },
                { key: 'actionItems', label: 'Action Items', available: !!actionItems }
              ].map(({ key, label, available }) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    available
                      ? selectedFormats[key]
                        ? 'border-accent-cyan bg-accent-cyan/10'
                        : 'border-accent-cyan/20 hover:border-accent-cyan/40'
                      : 'border-text-muted/20 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFormats[key]}
                    onChange={() => available && toggleFormat(key)}
                    disabled={!available}
                    className="w-5 h-5 rounded border-accent-cyan/30 text-accent-cyan focus:ring-accent-cyan focus:ring-offset-0"
                  />
                  <span className="text-text-primary font-medium">{label}</span>
                  {!available && (
                    <span className="ml-auto text-xs text-text-muted">(Not available)</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Export Format Options */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              Choose Export Format
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {exportFormats.map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.id}
                    onClick={() => handleExport(format)}
                    className="flex items-start gap-4 p-4 rounded-lg border border-accent-cyan/20 hover:border-accent-cyan hover:bg-accent-cyan/5 transition-all text-left group"
                  >
                    <div className={`p-2 bg-accent-cyan/10 rounded-lg group-hover:bg-accent-cyan/20 transition-colors`}>
                      <Icon className={`w-6 h-6 ${format.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-primary mb-1">
                        {format.name}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {format.description}
                      </p>
                    </div>
                    <Download className="w-5 h-5 text-text-secondary group-hover:text-accent-cyan transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Note */}
          <div className="p-4 bg-accent-purple/10 border border-accent-purple/30 rounded-lg">
            <p className="text-sm text-text-secondary">
              <strong className="text-text-primary">Note:</strong> The exported file will include only the selected content sections in your chosen format.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ExportButton;
