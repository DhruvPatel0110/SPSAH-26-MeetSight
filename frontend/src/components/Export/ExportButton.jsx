import { useState } from 'react';
import { Download, FileText, FileJson, FileCode } from 'lucide-react';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import { exportAsText, exportAsPDF, exportAsJSON, exportAsMarkdown } from '../../utils/exportHelpers';

const ExportButton = ({ transcript, summary, actionItems, variant = 'ghost' }) => {
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
      description: 'Document format (.pdf)',
      icon: FileText,
      handler: exportAsPDF
    },
    {
      id: 'txt',
      name: 'Text File',
      description: 'Plain text format (.txt)',
      icon: FileText,
      handler: exportAsText
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'Structured data format (.json)',
      icon: FileJson,
      handler: exportAsJSON
    },
    {
      id: 'md',
      name: 'Markdown',
      description: 'Markdown format (.md)',
      icon: FileCode,
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
        variant={variant}
        size="sm"
        icon={Download}
        onClick={() => setIsModalOpen(true)}
        disabled={!hasData}
      >
        Export
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Export Meeting Data"
        size="md"
      >
        <div className="space-y-6">
          {/* Content Selection */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint mb-3">
              Content to include
            </h3>
            <div className="space-y-2">
              {[
                { key: 'transcript', label: 'Transcript', available: !!transcript },
                { key: 'summary', label: 'Summary', available: !!summary },
                { key: 'actionItems', label: 'Action Items', available: !!actionItems }
              ].map(({ key, label, available }) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-sm transition-colors duration-150 cursor-pointer ${
                    available
                      ? selectedFormats[key]
                        ? 'border-accent bg-accent-soft text-ink'
                        : 'border-line hover:bg-raised text-ink'
                      : 'border-line opacity-40 cursor-not-allowed text-ink-faint'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFormats[key]}
                    onChange={() => available && toggleFormat(key)}
                    disabled={!available}
                    className="w-4 h-4 rounded border-line text-accent accent-accent focus:ring-accent focus:ring-2 focus:ring-offset-2 focus:ring-offset-canvas"
                  />
                  <span className="font-medium">{label}</span>
                  {!available && (
                    <span className="ml-auto text-xs text-ink-faint">(Not available)</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Export Format Options */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-ink-faint mb-3">
              Choose format
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exportFormats.map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.id}
                    onClick={() => handleExport(format)}
                    className="flex items-center gap-3 p-3.5 rounded-lg border border-line hover:border-ink-muted/40 hover:bg-raised transition-colors duration-150 text-left group focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-canvas"
                  >
                    <div className="p-2 bg-raised rounded-md text-ink group-hover:text-accent transition-colors duration-150">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-ink truncate">
                        {format.name}
                      </h4>
                      <p className="text-xs text-ink-muted truncate">
                        {format.description}
                      </p>
                    </div>
                    <Download className="w-4 h-4 text-ink-faint group-hover:text-ink transition-colors duration-150 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Note */}
          <div className="p-3.5 bg-raised border border-line rounded-lg">
            <p className="text-xs text-ink-muted leading-relaxed">
              Files are generated locally with only your selected content items.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ExportButton;
