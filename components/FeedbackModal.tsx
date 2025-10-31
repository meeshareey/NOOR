import React, { useState, useEffect } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  uiText: {
    modalTitle: string;
    placeholder: string;
    submitButton: string;
    cancelButton: string;
  };
  dir: 'ltr' | 'rtl';
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit, uiText, dir }) => {
  const [feedback, setFeedback] = useState('');

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

  const handleSubmit = () => {
    if (feedback.trim()) {
      onSubmit(feedback);
      setFeedback(''); // Clear feedback after submission
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      dir={dir}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4 transform transition-all animate-fade-in-down"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <h2 id="feedback-modal-title" className="text-2xl font-bold text-white mb-4">{uiText.modalTitle}</h2>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={uiText.placeholder}
          className="w-full h-32 p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          aria-label="Feedback input"
        />
        <div className="mt-6 flex justify-end space-x-4 rtl:space-x-reverse">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
            aria-label="Cancel feedback"
          >
            {uiText.cancelButton}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!feedback.trim()}
            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            aria-label="Submit feedback"
          >
            {uiText.submitButton}
          </button>
        </div>
      </div>
    </div>
  );
};