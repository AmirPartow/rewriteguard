/**
 * Paraphraser Component
 * =====================
 * 
 * A feature-rich text paraphrasing UI that allows users to rewrite their text
 * in different styles. Integrates with the /v1/paraphrase backend API.
 * 
 * Features:
 * - Input/Output text editors (side-by-side on desktop)
 * - 5 paraphrasing modes: Standard, Formal, Casual, Creative, Concise
 * - Copy to clipboard functionality with visual feedback
 * - Processing time display for performance monitoring
 * - Loading states and error handling
 * - Responsive design with beautiful animations
 * 
 * @author RewriteGuard Team
 */

import { useState } from 'react';

// Available paraphrasing modes - must match backend ParaphraseMode type
type ParaphraseMode = 'standard' | 'formal' | 'casual' | 'creative' | 'concise';

interface ParaphraseResponse {
    paraphrased_text: string;
    mode: ParaphraseMode;
    processing_time_ms: number;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
}

const MODE_INFO: Record<ParaphraseMode, { label: string; description: string; icon: string }> = {
    standard: { label: 'Standard', description: 'Balanced rewrite', icon: '✨' },
    formal: { label: 'Formal', description: 'Professional tone', icon: '🎩' },
    casual: { label: 'Casual', description: 'Conversational style', icon: '💬' },
    creative: { label: 'Creative', description: 'Unique expression', icon: '🎨' },
    concise: { label: 'Concise', description: 'Brief and clear', icon: '⚡' },
};

function Paraphraser() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [mode, setMode] = useState<ParaphraseMode>('standard');
    const [temperature, setTemperature] = useState(0.7);
    const [maxLength, setMaxLength] = useState(512);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timing, setTiming] = useState<number | null>(null);
    const [tokenUsage, setTokenUsage] = useState<{ input: number; output: number; total: number } | null>(null);
    const [copied, setCopied] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

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
                headers: {
                    'Content-Type': 'application/json',
                },
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

    return (
        <div className="w-full animate-fade-in-up">
            {/* Header */}
            <header className="mb-10 text-center">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-4 drop-shadow-sm">
                    AI Paraphraser
                </h1>
                <p className="text-gray-400 text-lg">
                    Transform your text with intelligent rewriting in multiple styles.
                </p>
            </header>

            {/* Mode Selection */}
            <div className="mb-6">
                <div className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 text-center">
                    Select Mode
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                    {(Object.keys(MODE_INFO) as ParaphraseMode[]).map((modeKey) => (
                        <button
                            key={modeKey}
                            onClick={() => setMode(modeKey)}
                            disabled={loading}
                            className={`
                px-5 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2
                ${mode === modeKey
                                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/25 scale-105'
                                    : 'bg-slate-800/50 border border-slate-700/50 text-gray-300 hover:bg-slate-700/50 hover:border-slate-600'
                                }
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
                        >
                            <span>{MODE_INFO[modeKey].icon}</span>
                            <span>{MODE_INFO[modeKey].label}</span>
                        </button>
                    ))}
                </div>
                <p className="text-center text-gray-500 text-sm mt-3">
                    {MODE_INFO[mode].description}
                </p>
            </div>

            {/* Advanced Settings Toggle */}
            <div className="mb-6 text-center">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-1 mx-auto"
                >
                    <svg
                        className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Advanced Settings
                </button>

                {showAdvanced && (
                    <div className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 max-w-md mx-auto animate-fade-in">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Temperature Control */}
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-2">
                                    Temperature: {temperature.toFixed(1)}
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={temperature}
                                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                    disabled={loading}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Precise</span>
                                    <span>Creative</span>
                                </div>
                            </div>

                            {/* Max Length Control */}
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-2">
                                    Max Length: {maxLength}
                                </label>
                                <input
                                    type="range"
                                    min="50"
                                    max="1024"
                                    step="50"
                                    value={maxLength}
                                    onChange={(e) => setMaxLength(parseInt(e.target.value))}
                                    disabled={loading}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>50</span>
                                    <span>1024</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">

                {/* Editors Container */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Input Editor */}
                    <div className="relative group">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Original Text
                        </label>
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl opacity-0 group-focus-within:opacity-20 transition duration-500 top-6"></div>
                        <textarea
                            className="w-full h-64 bg-slate-900/50 border border-slate-700 rounded-xl p-5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 resize-none text-base leading-relaxed transition-all"
                            placeholder="Enter the text you want to paraphrase..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            disabled={loading}
                        />
                        <div className="mt-2 flex justify-between text-sm text-gray-500">
                            <span>{inputText.length} characters</span>
                            {inputText && (
                                <button
                                    onClick={handleClear}
                                    className="text-gray-400 hover:text-gray-300 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Output Editor */}
                    <div className="relative">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-400">
                                Paraphrased Text
                            </label>
                            {outputText && (
                                <button
                                    onClick={handleCopy}
                                    className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300
                    ${copied
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
                                        }
                  `}
                                >
                                    {copied ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Copy
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        <div className={`
              w-full h-64 bg-slate-900/50 border border-slate-700 rounded-xl p-5 text-slate-100 overflow-auto
              ${loading ? 'flex items-center justify-center' : ''}
            `}>
                            {loading ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="relative w-12 h-12">
                                        <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
                                    </div>
                                    <span className="text-gray-400">Paraphrasing...</span>
                                </div>
                            ) : outputText ? (
                                <p className="text-base leading-relaxed whitespace-pre-wrap">{outputText}</p>
                            ) : (
                                <p className="text-slate-500 italic">Paraphrased text will appear here...</p>
                            )}
                        </div>
                        {timing !== null && (
                            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span><span className="font-mono text-emerald-400">{timing.toFixed(2)}ms</span></span>
                                </div>
                                {tokenUsage && (
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        <span>
                                            <span className="font-mono text-cyan-400">{tokenUsage.total}</span> tokens
                                            <span className="text-gray-600 text-xs ml-1">({tokenUsage.input}→{tokenUsage.output})</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center animate-shake">
                        {error}
                    </div>
                )}

                {/* Action Button */}
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleParaphrase}
                        disabled={loading || !inputText.trim()}
                        className={`
              px-10 py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 text-lg
              ${loading || !inputText.trim()
                                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                                : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:shadow-emerald-500/25 hover:scale-105 active:scale-95'
                            }
            `}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Paraphrasing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Paraphrase Text
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-gray-600 text-sm">
                Powered by RewriteGuard T5 Paraphrase Model
            </p>
        </div>
    );
}

export default Paraphraser;
