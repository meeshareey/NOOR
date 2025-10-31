import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getVocabularyForCategory, generateSpeech } from '../services/geminiService';
import { Language, VocabularyItem } from '../types';
import { VOCABULARY_CATEGORIES } from '../constants';
import { decode, decodeAudioData } from '../utils/audio';

interface VocabularyViewProps {
  currentLanguage: Language;
  uiText: {
    title: string;
    subtitle: string;
    selectCategory: string;
    tableHeadArabic: string;
    tableHeadEnglish: string;
    tableHeadHausa: string;
    errorGeneric: string;
    errorNetwork: string;
    errorApiKey: string;
    errorQuota: string;
    retryButton: string;
  }
}

const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-2">
        {[...Array(10)].map((_, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-gray-700/50 rounded">
                 <div className="h-4 bg-gray-500 rounded w-1/4"></div>
                 <div className="h-4 bg-gray-500 rounded w-1/4"></div>
                 <div className="h-4 bg-gray-500 rounded w-1/4"></div>
            </div>
        ))}
    </div>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const SpeakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const SpeakerPlayingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const SpinnerIcon = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white/80"></div>
);


export const VocabularyView: React.FC<VocabularyViewProps> = ({ currentLanguage, uiText }) => {
    const [selectedCategory, setSelectedCategory] = useState(VOCABULARY_CATEGORIES[0]);
    const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [audioState, setAudioState] = useState<{index: number, status: 'loading' | 'playing'} | null>(null);
    const [retryAction, setRetryAction] = useState<(() => void) | null>(null);

    const observer = useRef<IntersectionObserver>();
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const audioCacheRef = useRef<Record<string, AudioBuffer>>({});

    const getDisplayErrorMessage = (e: any): string => {
        let errorMessage = uiText.errorGeneric;
        if (!navigator.onLine) {
            errorMessage = uiText.errorNetwork;
        } else {
            const lowerCaseMessage = (e.message || '').toLowerCase();
            if (lowerCaseMessage.includes('api key')) {
                errorMessage = uiText.errorApiKey;
            } else if (lowerCaseMessage.includes('quota') || lowerCaseMessage.includes('resource has been exhausted')) {
                errorMessage = uiText.errorQuota;
            } else if (lowerCaseMessage.includes('fetch failed') || lowerCaseMessage.includes('network error')) {
                errorMessage = uiText.errorNetwork;
            }
        }
        return errorMessage;
    };

    const fetchMore = useCallback(async () => {
        if (isLoading) return;
        setIsLoading(true);
        setError(null);
        setRetryAction(null);
        try {
            const existingArabicWords = vocabulary.map(v => v.arabic);
            const newVocab = await getVocabularyForCategory(selectedCategory, existingArabicWords);
            setVocabulary(prev => [...prev, ...newVocab]);
        } catch (e: any) {
            const errorMessage = getDisplayErrorMessage(e);
            setError(errorMessage);
            if (errorMessage !== uiText.errorApiKey) {
                setRetryAction(() => () => fetchMore());
            }
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, vocabulary, selectedCategory, uiText]);
    
    const fetchInitial = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setRetryAction(null);
        setVocabulary([]);
        try {
            const newVocab = await getVocabularyForCategory(selectedCategory);
            setVocabulary(newVocab);
        } catch (e: any) {
            const errorMessage = getDisplayErrorMessage(e);
            setError(errorMessage);
            if (errorMessage !== uiText.errorApiKey) {
                setRetryAction(() => () => fetchInitial());
            }
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory, uiText]);


    const lastVocabElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                fetchMore();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, fetchMore]);

    useEffect(() => {
        fetchInitial();
    }, [fetchInitial]);

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
    };

    const handleCopy = (text: string, index: number) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                setCopiedIndex(index);
                setTimeout(() => {
                    setCopiedIndex(null);
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        }
    };
    
    const playAudio = async (text: string, index: number) => {
        if (audioState?.index === index && audioState.status === 'loading') return;

        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current.disconnect();
            audioSourceRef.current = null;
        }

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const context = audioContextRef.current;
        if (context.state === 'suspended') {
            await context.resume();
        }

        try {
            setAudioState({ index, status: 'loading' });
            let audioBuffer = audioCacheRef.current[text];

            if (!audioBuffer) {
                const base64Audio = await generateSpeech(text);
                const audioData = decode(base64Audio);
                audioBuffer = await decodeAudioData(audioData, context);
                audioCacheRef.current[text] = audioBuffer;
            }
            
            const source = context.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(context.destination);
            source.start(0);

            audioSourceRef.current = source;
            setAudioState({ index, status: 'playing' });

            source.onended = () => {
                if (audioState?.index === index) {
                    setAudioState(null);
                }
                if (audioSourceRef.current === source) {
                    audioSourceRef.current = null;
                }
            };

        } catch (err) {
            console.error("Failed to play audio:", err);
            setError(getDisplayErrorMessage(err));
            setAudioState(null);
        }
    };

    return (
        <div className="w-full max-w-4xl text-center" dir={currentLanguage.dir}>
            <div className="mb-8 animate-fade-in-down">
                <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-400">
                    {uiText.title}
                </h1>
                <p className="text-lg md:text-xl text-white/80">
                    {uiText.subtitle}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                 <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="bg-white/20 text-white py-3 px-4 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer w-full sm:w-auto"
                    aria-label={uiText.selectCategory}
                    >
                    {VOCABULARY_CATEGORIES.map(cat => (
                        <option key={cat} value={cat} className="text-black">{cat}</option>
                    ))}
                </select>
            </div>

            <div className="w-full max-w-4xl mx-auto text-left">
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg my-4 flex justify-between items-center" role="alert">
                         <div>
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                        {retryAction && (
                            <button
                                onClick={retryAction}
                                className="ml-4 rtl:mr-4 rtl:ml-0 bg-red-400/50 hover:bg-red-400/70 text-white font-bold py-1 px-3 rounded"
                            >
                                {uiText.retryButton}
                            </button>
                        )}
                    </div>
                )}
                {isLoading && vocabulary.length === 0 ? <LoadingSkeleton /> :
                vocabulary.length > 0 && (
                    <div className="bg-black/20 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                        <table className="w-full text-white">
                            <thead className="bg-white/10 text-left">
                                <tr>
                                    <th className="p-4 font-semibold">{uiText.tableHeadArabic}</th>
                                    <th className="p-4 font-semibold">{uiText.tableHeadEnglish}</th>
                                    <th className="p-4 font-semibold">{uiText.tableHeadHausa}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vocabulary.map((item, index) => (
                                    <tr ref={index === vocabulary.length - 1 ? lastVocabElementRef : null} key={index} className="border-b border-white/10 last:border-b-0 hover:bg-white/5">
                                        <td className="p-4 text-lg" style={{ fontFamily: "'Amiri', sans-serif" }}>
                                            <div className="flex items-center justify-between gap-2">
                                                <span>{item.arabic}</span>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <button
                                                        onClick={() => playAudio(item.arabic, index)}
                                                        className="text-white/60 hover:text-white transition-colors duration-200 focus:outline-none p-1 rounded-full hover:bg-white/10"
                                                        title="Play pronunciation"
                                                        aria-label="Play pronunciation of Arabic word"
                                                        disabled={audioState?.index === index && audioState?.status === 'loading'}
                                                    >
                                                         {audioState?.index === index ? (
                                                            audioState.status === 'loading' ? <SpinnerIcon /> : <SpeakerPlayingIcon />
                                                        ) : (
                                                            <SpeakerIcon />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleCopy(item.arabic, index)}
                                                        className="text-white/60 hover:text-white transition-colors duration-200 focus:outline-none p-1 rounded-full hover:bg-white/10"
                                                        title={copiedIndex === index ? "Copied!" : "Copy to clipboard"}
                                                        aria-label={copiedIndex === index ? "Copied to clipboard" : "Copy Arabic word to clipboard"}
                                                    >
                                                        {copiedIndex === index ? <CheckIcon /> : <CopyIcon />}
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">{item.english}</td>
                                        <td className="p-4">{item.hausa}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {isLoading && <div className="p-4 text-center text-white/70 animate-pulse">Loading more...</div>}
                    </div>
                )}
            </div>
        </div>
    );
};