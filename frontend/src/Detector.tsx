import { useState } from 'react';

interface SentenceResult {
    text: string;
    ai_probability: number;
    label: 'ai' | 'human';
}

interface DetectResponse {
    label: 'ai' | 'human';
    probability: number;
    sentences?: SentenceResult[];
}

function Detector() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DetectResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDetect = async () => {
        if (!text.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/v1/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                if (response.status === 504) {
                    throw new Error('Analysis timed out. Please try shorter text.');
                }
                throw new Error('Failed to analyze text. Please try again.');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const getOverallColor = (prob: number) => {
        if (prob >= 0.7) return 'text-red-500';
        if (prob >= 0.4) return 'text-orange-400';
        return 'text-emerald-400';
    };

    const getProgressGradient = (prob: number) => {
        if (prob >= 0.7) return 'from-red-500 to-orange-500';
        if (prob >= 0.4) return 'from-orange-400 to-yellow-400';
        return 'from-emerald-500 to-cyan-500';
    };

    // Returns a background color with opacity based on AI probability
    const getSentenceHighlight = (aiProb: number): string => {
        if (aiProb >= 0.8) return 'bg-red-500/25 border-l-red-500';
        if (aiProb >= 0.6) return 'bg-orange-500/20 border-l-orange-500';
        if (aiProb >= 0.4) return 'bg-yellow-500/15 border-l-yellow-500';
        return 'bg-emerald-500/10 border-l-emerald-500';
    };

    const getSentenceLabel = (aiProb: number): string => {
        if (aiProb >= 0.8) return 'Very likely AI';
        if (aiProb >= 0.6) return 'Likely AI';
        if (aiProb >= 0.4) return 'Uncertain';
        return 'Likely Human';
    };

    const getSentenceLabelColor = (aiProb: number): string => {
        if (aiProb >= 0.8) return 'text-red-400';
        if (aiProb >= 0.6) return 'text-orange-400';
        if (aiProb >= 0.4) return 'text-yellow-400';
        return 'text-emerald-400';
    };

    const aiPercentage = result ? Math.round(result.probability * 100) : 0;

    return (
        <div className="w-full animate-fade-in-up">

            {/* Header */}
            <header className="mb-12 text-center">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4 drop-shadow-sm">
                    AI Content Detector
                </h1>
                <p className="text-gray-400 text-lg">
                    Analyze text patterns to distinguish between human and AI-generated content.
                </p>
            </header>

            {/* Main Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">

                {/* Input Area */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-20 transition duration-500 pointer-events-none"></div>
                    <textarea
                        id="detector-text"
                        className="w-full h-64 bg-slate-900/50 border border-slate-700 rounded-xl p-6 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 resize-none text-lg leading-relaxed transition-all cursor-text"
                        placeholder="Paste your text here to analyze..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={loading}
                        spellCheck={false}
                    />
                </div>

                {/* Action Bar */}
                <div className="mt-8 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        {text.length} characters
                    </div>
                    <button
                        onClick={handleDetect}
                        disabled={loading || !text.trim()}
                        className={`
              px-8 py-3 rounded-lg font-semibold text-white shadow-lg transition-all duration-300
              ${loading || !text.trim()
                                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/25 hover:scale-105 active:scale-95'}
            `}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Analyzing...
                            </span>
                        ) : (
                            'Detect Patterns'
                        )}
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center animate-shake">
                        {error}
                    </div>
                )}

                {/* Results Section */}
                {result && !loading && (
                    <div className="mt-8 pt-8 border-t border-slate-700/50 animate-fade-in">

                        {/* Overall Result */}
                        <div className="flex flex-col items-center mb-10">
                            <div className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Detection Result</div>
                            <div className={`text-5xl font-bold mb-1 ${getOverallColor(result.probability)}`}>
                                {aiPercentage}% AI Content
                            </div>
                            <div className="text-gray-500 text-sm mb-6">
                                {result.label === 'ai'
                                    ? 'This text appears to be AI-generated'
                                    : 'This text appears to be human-written'}
                            </div>

                            <div className="w-full bg-slate-700/50 rounded-full h-4 mb-4 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r ${getProgressGradient(result.probability)}`}
                                    style={{ width: `${result.probability * 100}%` }}
                                />
                            </div>

                            <div className="flex justify-between w-full text-sm text-gray-400 px-1">
                                <span>AI Confidence</span>
                                <span className="font-mono text-white">{(result.probability * 100).toFixed(1)}%</span>
                            </div>
                        </div>

                        {/* Sentence-by-Sentence Breakdown */}
                        {result.sentences && result.sentences.length > 0 && (
                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Sentence Analysis
                                    </h3>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500/60"></span>AI</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500/60"></span>Likely AI</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></span>Uncertain</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"></span>Human</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {result.sentences.map((sentence, i) => (
                                        <div
                                            key={i}
                                            className={`
                                                p-4 rounded-xl border-l-4 transition-all
                                                ${getSentenceHighlight(sentence.ai_probability)}
                                            `}
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                <p className="text-gray-200 text-[15px] leading-relaxed flex-1">
                                                    {sentence.text}
                                                </p>
                                                <div className="flex flex-col items-end flex-shrink-0 gap-1 min-w-[100px]">
                                                    <span className={`text-xs font-bold uppercase tracking-wider ${getSentenceLabelColor(sentence.ai_probability)}`}>
                                                        {getSentenceLabel(sentence.ai_probability)}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-mono">
                                                        {Math.round(sentence.ai_probability * 100)}% AI
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Mini progress bar */}
                                            <div className="mt-2 w-full bg-slate-700/30 rounded-full h-1 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${getProgressGradient(sentence.ai_probability)}`}
                                                    style={{ width: `${sentence.ai_probability * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-gray-600 text-sm">
                Powered by RewriteGuard AI Detection Model
            </p>
        </div>
    );
}

export default Detector;
