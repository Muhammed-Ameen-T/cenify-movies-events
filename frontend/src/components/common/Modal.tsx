import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  preventClose?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  title, 
  icon, 
  onClose, 
  children, 
  maxWidth = 'max-w-md',
  preventClose = false
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, preventClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !preventClose) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70"
      onClick={handleBackdropClick}
    >
      <div 
        className={`${maxWidth} w-full bg-[#1A1A27] rounded-lg shadow-xl transition-all duration-300 animate-modalFadeIn`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center">
            {icon && <span className="mr-2 text-blue-500">{icon}</span>}
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          {!preventClose && (
            <button 
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;