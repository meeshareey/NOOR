import React, { useState, useRef } from 'react';
import { SearchBar } from './SearchBar';
import { ResultsDisplay } from './ResultsDisplay';
import { FeedbackModal } from './FeedbackModal';
import { searchTheWeb } from '../services/geminiService';
import { Language, SearchResult } from '../types';

interface SearchViewProps {
  currentLanguage: Language;
  uiText: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    searchPlaceholder: string;
    searchButton: string;
    sources: string;
    noSources: string;
    errorGeneric: string;
    errorNetwork: string;
    errorApiKey: string;
    errorQuota: string;
    feedbackButton: string;
    feedbackModalTitle: string;
    feedbackPlaceholder: string;
    submitButton: string;
    cancelButton: string;
    retryButton: string;
  }
}

const fileToDataUrl = (file: File): Promise<{ data: string; mimeType: string; }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ data: reader.result as string, mimeType: file.type });
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

export const SearchView: React.FC<SearchViewProps> = ({ currentLanguage, uiText }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<SearchResult | null>(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [image, setImage] = useState<{ data: string; mimeType: string; } | null>(null);
    const [isRetryable, setIsRetryable] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSearch = async () => {
        if (!query.trim() && !image) return;

        setIsLoading(true);
        setError(null);
        setResult(null);
        setIsRetryable(false);

        try {
            const imageData = image ? {
                base64: image.data.split(',')[1],
                mimeType: image.mimeType,
            } : undefined;
            const response = await searchTheWeb(query, currentLanguage.name, imageData);
            setResult(response);
        } catch (e: any) {
            let errorMessage = uiText.errorGeneric;
            let shouldBeRetryable = true;

            if (!navigator.onLine) {
                errorMessage = uiText.errorNetwork;
            } else {
                const lowerCaseMessage = (e.message || '').toLowerCase();
                if (lowerCaseMessage.includes('api key')) {
                    errorMessage = uiText.errorApiKey;
                    shouldBeRetryable = false;
                } else if (lowerCaseMessage.includes('quota') || lowerCaseMessage.includes('resource has been exhausted')) {
                    errorMessage = uiText.errorQuota;
                } else if (lowerCaseMessage.includes('fetch failed') || lowerCaseMessage.includes('network error')) {
                    errorMessage = uiText.errorNetwork;
                }
            }
            setError(errorMessage);
            if (shouldBeRetryable) {
                setIsRetryable(true);
            }
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFeedbackSubmit = (feedback: string) => {
        console.log("--- User Feedback ---");
        console.log("Query:", query);
        if (image) console.log("Image attached:", image.mimeType);
        console.log("Result Text (first 100 chars):", result?.text.substring(0, 100) + '...');
        console.log("Feedback:", feedback);
        console.log("---------------------");
        setIsFeedbackModalOpen(false);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const imageData = await fileToDataUrl(file);
                setImage(imageData);
            } catch (err) {
                console.error("Error reading file:", err);
                setError("Failed to read the image file.");
            }
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleAttachFileClick = () => {
        fileInputRef.current?.click();
    };


    return (
        <div className="w-full max-w-4xl text-center">
             <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
            {!result && !isLoading && !image && (
                <div className="mb-8 animate-fade-in-down">
                    <h1 className="text-5xl md:text-7xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-400">
                        {uiText.welcomeTitle}
                    </h1>
                    <p className="text-lg md:text-xl text-white/80">
                        {uiText.welcomeSubtitle}
                    </p>
                </div>
            )}
            <div className="mb-8">
                <SearchBar
                    query={query}
                    setQuery={setQuery}
                    handleSearch={handleSearch}
                    isLoading={isLoading}
                    placeholder={uiText.searchPlaceholder}
                    buttonText={uiText.searchButton}
                    dir={currentLanguage.dir}
                    onAttachFile={handleAttachFileClick}
                    imageAttached={!!image}
                />
            </div>

             {image && (
                <div className="mb-8 relative inline-block animate-fade-in">
                    <img src={image.data} alt="Search preview" className="max-h-60 rounded-lg shadow-xl" />
                    <button
                        onClick={() => setImage(null)}
                        className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full p-1 leading-none w-7 h-7 flex items-center justify-center text-xl font-bold hover:bg-black transition-transform transform hover:scale-110"
                        title="Remove image"
                        aria-label="Remove attached image"
                    >
                        &times;
                    </button>
                </div>
            )}

            <div className="w-full max-w-4xl mx-auto text-left">
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg flex justify-between items-center" role="alert">
                        <div>
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                        {isRetryable && (
                            <button
                                onClick={handleSearch}
                                className="ml-4 rtl:mr-4 rtl:ml-0 bg-red-400/50 hover:bg-red-400/70 text-white font-bold py-1 px-3 rounded"
                            >
                                {uiText.retryButton}
                            </button>
                        )}
                    </div>
                )}
                <ResultsDisplay
                    result={result}
                    isLoading={isLoading}
                    dir={currentLanguage.dir}
                    labels={{ sources: uiText.sources, noSources: uiText.noSources }}
                />

                {result && !isLoading && !error && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsFeedbackModalOpen(true)}
                            className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                            aria-label="Provide feedback on the search results"
                        >
                            {uiText.feedbackButton}
                        </button>
                    </div>
                )}
            </div>
            
            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                onSubmit={handleFeedbackSubmit}
                uiText={{
                    modalTitle: uiText.feedbackModalTitle,
                    placeholder: uiText.feedbackPlaceholder,
                    submitButton: uiText.submitButton,
                    cancelButton: uiText.cancelButton,
                }}
                dir={currentLanguage.dir}
            />
        </div>
    );
}