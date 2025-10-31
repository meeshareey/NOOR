import React, { useEffect } from 'react';

interface CameraSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (facingMode: 'user' | 'environment') => void;
  uiText: {
    modalTitle: string;
    frontCamera: string;
    backCamera: string;
  };
  dir: 'ltr' | 'rtl';
}

const FrontCameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 rtl:ml-2 rtl:mr-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const BackCameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 rtl:ml-2 rtl:mr-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const CameraSelectionModal: React.FC<CameraSelectionModalProps> = ({ isOpen, onClose, onSelect, uiText, dir }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      dir={dir}
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-select-modal-title"
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm m-4 transform transition-all animate-fade-in-down"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <h2 id="camera-select-modal-title" className="text-2xl font-bold text-white mb-6 text-center">{uiText.modalTitle}</h2>
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => onSelect('user')}
            className="w-full flex items-center justify-center px-4 py-3 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors text-lg"
            aria-label={uiText.frontCamera}
          >
            <FrontCameraIcon />
            {uiText.frontCamera}
          </button>
          <button
            onClick={() => onSelect('environment')}
            className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors text-lg"
            aria-label={uiText.backCamera}
          >
            <BackCameraIcon />
            {uiText.backCamera}
          </button>
        </div>
      </div>
    </div>
  );
};