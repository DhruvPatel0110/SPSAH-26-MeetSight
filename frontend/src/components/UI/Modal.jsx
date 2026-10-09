import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl'
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop: rgba(18,15,13,0.45) with NO blur */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-[#120F0D]/45 transition-opacity duration-200"
        aria-hidden="true"
      />
      
      {/* Modal Surface Panel: rounded-xl, 1px line border, shadow-xl only in light mode */}
      <div 
        className={`relative z-10 w-full ${sizes[size] || sizes.md} bg-surface border border-line rounded-xl shadow-xl dark:shadow-none overflow-hidden my-6 transition-all duration-200`}
      >
        {/* Header if title provided */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-line">
            <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-widest">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-ink-faint hover:text-ink hover:bg-raised rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* If no header title, close button top right */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 text-ink-faint hover:text-ink hover:bg-raised rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-4rem)] p-6 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
};

export default Modal;
