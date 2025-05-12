import React, { ReactNode } from 'react';

interface ModalProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, icon, children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="bg-[#1E1E2D] rounded-lg shadow-xl border border-gray-700 w-full max-w-md p-6 relative transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center mb-4">
            {icon && <span className="mr-2 text-blue-500">{icon}</span>}
            <h3 className="text-xl font-semibold text-white">{title}</h3>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;