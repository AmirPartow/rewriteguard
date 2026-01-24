import { useState } from 'react';

interface DetectResponse {
    label: 'ai' | 'human';
    probability: number;
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

    const getScoreColor = (score: number, label: string) => {
        if (label === 'ai') {
            return score > 0.8 ? 'text-red-500' : 'text-orange-500';
        }
        return score > 0.8 ? 'text-green-500' : 'text-blue-500';
    };

    const getProgressColor = (label: string) => {
        return label === 'ai' ? 'bg-red-500' : 'bg-green-500';
    }

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
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
                    <textarea
                        className="w-full h-64 bg-slate-900/50 border border-slate-700 rounded-xl p-6 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 resize-none text-lg leading-relaxed transition-all"
                        placeholder="Paste your text here to analyze..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={loading}
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
                        <div className="flex flex-col items-center">
                            <div className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Detection Result</div>
                            <div className={`text-5xl font-bold mb-4 capitalize ${getScoreColor(result.probability, result.label)}`}>
                                {result.label === 'ai' ? 'AI Generated' : 'Human Written'}
                            </div>

                            <div className="w-full bg-slate-700/50 rounded-full h-4 mb-4 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out ${getProgressColor(result.label)}`}
                                    style={{ width: `${result.probability * 100}%` }}
                                />
                            </div>

                            <div className="flex justify-between w-full text-sm text-gray-400 px-1">
                                <span>Confidence Score</span>
                                <span className="font-mono text-white">{(result.probability * 100).toFixed(2)}%</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-gray-600 text-sm">
                Powered by RewriteGuard DeBERTa Model
            </p>
        </div>
    );
}

export default Detector;
