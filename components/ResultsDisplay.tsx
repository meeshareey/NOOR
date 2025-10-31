import React from 'react';
import { SearchResult } from '../types';

interface ResultsDisplayProps {
  result: SearchResult | null;
  isLoading: boolean;
  dir: 'ltr' | 'rtl';
  labels: {
      sources: string;
      noSources: string;
  }
}

const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2 mt-8"></div>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
    </div>
);


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading, dir, labels }) => {
  if (isLoading) {
    return <div className="bg-black/20 backdrop-blur-sm p-6 md:p-8 rounded-lg shadow-lg w-full"><LoadingSkeleton /></div>;
  }

  if (!result) {
    return null;
  }

  const { text, sources } = result;
  const validSources = sources.filter(source => source.web && source.web.uri && source.web.title);

  return (
    <div className="bg-black/20 backdrop-blur-sm p-6 md:p-8 rounded-lg shadow-lg w-full" dir={dir}>
      <div className="prose prose-lg prose-invert max-w-none whitespace-pre-wrap leading-relaxed font-semibold">
        {text}
      </div>
      
      {validSources.length > 0 && (
         <div className="mt-8 pt-6 border-t border-white/20">
            <h3 className="text-xl font-bold mb-4 text-teal-400">{labels.sources}</h3>
            <ul className="space-y-2 list-inside">
            {validSources.map((source, index) => (
                <li key={index} className="flex items-start">
                    <span className="text-teal-400 mt-1 mr-2 rtl:ml-2 rtl:mr-0">➔</span>
                    <a href={source.web!.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all">
                        {source.web!.title}
                    </a>
                </li>
            ))}
            </ul>
        </div>
      )}
    </div>
  );
};