import React from 'react';

interface AboutViewProps {
  uiText: {
    title: string;
    content: string;
  };
  dir: 'ltr' | 'rtl';
}

export const AboutView: React.FC<AboutViewProps> = ({ uiText, dir }) => {
  return (
    <div className="w-full max-w-4xl text-left animate-fade-in-down" dir={dir}>
      <div className="bg-black/20 backdrop-blur-sm p-6 md:p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-400">
          {uiText.title}
        </h1>
        <div className="prose prose-lg prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
          {uiText.content.split('\n\n').map((paragraph, index) => {
            // Check for markdown-style bolding and render it
            const parts = paragraph.split(/(\*\*.*?\*\*)/g);
            return (
              <p key={index}>
                {parts.map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};