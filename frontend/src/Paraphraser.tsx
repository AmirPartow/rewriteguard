/**
 * Paraphraser Component
 * =====================
 * 
 * QuillBot-inspired paraphrasing UI with dark theme.
 * Shows word-level change highlighting on the output side.
 * Fixed-height panels with internal scrolling (no growing box).
 * 
 * @author RewriteGuard Team
 */

import { useState, useEffect, useMemo } from 'react';

type ParaphraseMode = 'standard' | 'formal' | 'casual' | 'creative' | 'concise';

interface ParaphraseResponse {
    paraphrased_text: string;
    mode: ParaphraseMode;
    processing_time_ms: number;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
}

interface ParaphraserProps {
    initialText?: string;
    onTextConsumed?: () => void;
}

const MODE_TABS: { key: ParaphraseMode; label: string }[] = [
    { key: 'standard', label: 'Standard' },
    { key: 'casual', label: 'Fluency' },
    { key: 'creative', label: 'Humanize' },
    { key: 'formal', label: 'Formal' },
    { key: 'concise', label: 'Academic' },
];

/**
 * Compute word-level diff between original and paraphrased text.
 * Returns an array of { word, changed } for each word in the output.
 */
function computeWordDiff(original: string, paraphrased: string): { word: string; changed: boolean }[] {
    const origWords = new Set(original.toLowerCase().split(/\s+/).filter(w => w.length > 0));
    const paraWords = paraphrased.split(/(\s+)/); // preserve whitespace

    return paraWords.map(token => {
        if (/^\s+$/.test(token)) {
            return { word: token, changed: false }; // whitespace
        }
        // Check if this word (lowercased, stripped of punctuation) exists in original
        const cleanWord = token.toLowerCase().replace(/[^a-z0-9']/g, '');
        const isChanged = cleanWord.length > 0 && !origWords.has(cleanWord);
        return { word: token, changed: isChanged };
    });
}

function Paraphraser({ initialText, onTextConsumed }: ParaphraserProps) {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [mode, setMode] = useState<ParaphraseMode>('standard');
    const [temperature] = useState(0.7);
    const [maxLength] = useState(1024);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timing, setTiming] = useState<number | null>(null);
    const [tokenUsage, setTokenUsage] = useState<{ input: number; output: number; total: number } | null>(null);
    const [copied, setCopied] = useState(false);

    // Consume initialText from Detector when it arrives
    useEffect(() => {
        if (initialText && initialText.trim()) {
            setInputText(initialText);
            if (onTextConsumed) onTextConsumed();
        }
    }, [initialText, onTextConsumed]);

    // Compute word diff for highlighting
    const wordDiff = useMemo(() => {
        if (!outputText || !inputText) return [];
        return computeWordDiff(inputText, outputText);
    }, [inputText, outputText]);

    const handleParaphrase = async () => {
        if (!inputText.trim()) return;

        setLoading(true);
        setError(null);
        setOutputText('');
        setTiming(null);
        setTokenUsage(null);

        try {
            const response = await fetch('/v1/paraphrase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: inputText,
                    mode,
                    temperature,
                    max_length: maxLength
                }),
            });

            if (!response.ok) {
                if (response.status === 504) {
                    throw new Error('Paraphrasing timed out. Please try shorter text.');
                }
                throw new Error('Failed to paraphrase text. Please try again.');
            }

            const data: ParaphraseResponse = await response.json();
            setOutputText(data.paraphrased_text);
            setTiming(data.processing_time_ms);
            setTokenUsage({
                input: data.input_tokens,
                output: data.output_tokens,
                total: data.total_tokens
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!outputText) return;
        try {
            await navigator.clipboard.writeText(outputText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setError('Failed to copy to clipboard');
        }
    };

    const handleClear = () => {
        setInputText('');
        setOutputText('');
        setError(null);
        setTiming(null);
        setTokenUsage(null);
    };

    const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    const outputWordCount = outputText.trim() ? outputText.trim().split(/\s+/).length : 0;

    return (
        <div className="w-full flex flex-col animate-fade-in text-gray-200">

            {/* Language + Mode Tabs Bar */}
            <div className="bg-white/5 border border-white/10 rounded-t-xl px-6 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-blue-400 font-semibold border-b-2 border-blue-400 pb-1 cursor-pointer">English (US)</span>
                        <span className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">French</span>
                        <span className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">Spanish</span>
                        <span className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">German</span>
                        <span className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">All ▾</span>
                    </div>
                </div>
            </div>

            {/* Mode Tabs */}
            <div className="bg-white/[0.03] border-x border-white/10 px-6 py-2 flex items-center gap-1 shrink-0">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mr-3">Modes:</span>
                {MODE_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setMode(tab.key)}
                        disabled={loading}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                            ${mode === tab.key
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}
                            ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
                <button className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-white/5 hover:text-gray-300 cursor-pointer transition-all">
                    More ▾
                </button>
            </div>

            {/* Main Content: Two Columns — FIXED HEIGHT, internal scroll */}
            <div className="flex flex-col md:flex-row border border-white/10 border-t-0 rounded-b-xl overflow-hidden" style={{ height: '500px' }}>

                {/* Left Column: Input */}
                <div className="flex-1 flex flex-col bg-white/5 relative min-h-0">
                    {/* Clear button */}
                    <div className="absolute top-4 right-4 z-20">
                        {inputText && (
                            <button
                                onClick={handleClear}
                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors bg-white/5 backdrop-blur-sm"
                                title="Clear text"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        )}
                    </div>

                    <textarea
                        className="flex-1 w-full p-8 text-gray-300 bg-transparent focus:outline-none resize-none text-[16px] leading-[1.8] font-normal placeholder-gray-600 overflow-y-auto min-h-0"
                        placeholder="Enter the text you want to paraphrase..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={loading}
                        spellCheck={false}
                    />

                    {/* Bottom Bar */}
                    <div className="h-14 border-t border-white/5 px-6 flex items-center justify-between bg-[#0f172a]/50 shrink-0">
                        <div className="text-gray-500 text-sm font-semibold tracking-tight">
                            {wordCount} Words
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="p-1.5 text-gray-500 hover:text-blue-400 transition-colors rounded-lg hover:bg-white/5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                            </button>
                            <button className="p-1.5 text-gray-500 hover:text-orange-400 transition-colors rounded-lg hover:bg-white/5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                            </button>
                            {outputText && !loading && (
                                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-fade-in">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    Analysis complete
                                </div>
                            )}
                            <button
                                onClick={handleParaphrase}
                                disabled={loading || !inputText.trim()}
                                className={`
                                    px-8 py-2 rounded-full font-bold transition-all flex items-center gap-2 text-sm
                                    ${loading || !inputText.trim()
                                        ? 'bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 shadow-lg shadow-blue-500/20 active:scale-95'}
                                `}
                            >
                                {loading ? 'Paraphrasing...' : 'Paraphrase'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px bg-white/10 hidden md:block"></div>

                {/* Right Column: Output with word-change highlighting */}
                <div className="flex-1 flex flex-col bg-white/[0.02] relative min-h-0">
                    {/* Copy button */}
                    {outputText && (
                        <div className="absolute top-4 right-4 z-20">
                            <button
                                onClick={handleCopy}
                                className={`
                                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300
                                    ${copied
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'}
                                `}
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Output text area with word-diff highlighting — scrollable */}
                    <div className="flex-1 p-8 overflow-y-auto min-h-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4">
                                <div className="relative w-12 h-12">
                                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                                </div>
                                <span className="text-gray-400 text-sm font-medium">Paraphrasing your text...</span>
                            </div>
                        ) : outputText ? (
                            <div className="text-[16px] leading-[1.8] font-normal whitespace-pre-wrap">
                                {wordDiff.map((item, idx) => (
                                    <span
                                        key={idx}
                                        className={item.changed ? 'text-blue-400 font-medium' : 'text-gray-300'}
                                    >
                                        {item.word}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600 italic text-[16px]">Paraphrased text will appear here...</p>
                        )}
                    </div>

                    {/* Output Bottom Bar */}
                    <div className="h-14 border-t border-white/5 px-6 flex items-center gap-6 bg-[#0f172a]/50 shrink-0">
                        {outputText && (
                            <div className="text-gray-500 text-sm font-semibold tracking-tight">
                                {outputWordCount} Words
                            </div>
                        )}
                        {timing !== null && (
                            <>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="font-mono text-blue-400">{timing.toFixed(0)}ms</span>
                                </div>
                                {tokenUsage && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
                                        <span className="font-mono text-purple-400">{tokenUsage.total}</span>
                                        <span>tokens</span>
                                        <span className="text-gray-600 text-xs">({tokenUsage.input}→{tokenUsage.output})</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Right Sidebar Icons (QuillBot style) */}
                <div className="hidden md:flex flex-col items-center gap-1 w-14 bg-white/[0.02] border-l border-white/10 py-4 shrink-0">
                    <button className="p-2.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors group flex flex-col items-center gap-1" title="History">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-[9px] font-semibold">History</span>
                    </button>
                    <button className="p-2.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors group flex flex-col items-center gap-1" title="Compare Modes">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        <span className="text-[9px] font-semibold">Compare</span>
                    </button>
                    <button className="p-2.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors group flex flex-col items-center gap-1" title="Statistics">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        <span className="text-[9px] font-semibold">Stats</span>
                    </button>
                    <button className="p-2.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors group flex flex-col items-center gap-1" title="Tone">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                        <span className="text-[9px] font-semibold">Tone</span>
                    </button>
                    <div className="flex-1"></div>
                    <button className="p-2.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors group flex flex-col items-center gap-1" title="Settings">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                        <span className="text-[9px] font-semibold">Settings</span>
                    </button>
                    <button className="p-2.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors group flex flex-col items-center gap-1" title="Feedback">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        <span className="text-[9px] font-semibold">Feedback</span>
                    </button>
                    <button className="p-2.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors group flex flex-col items-center gap-1" title="Hotkeys">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></svg>
                        <span className="text-[9px] font-semibold">Hotkeys</span>
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3 animate-shake shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {error}
                </div>
            )}
        </div>
    );
}

export default Paraphraser;
