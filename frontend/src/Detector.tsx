import { useState, useEffect } from 'react';

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

    // Listen for "grab-detector-text" event to send text to Paraphraser
    useEffect(() => {
        const handleGrab = () => {
            if (text.trim()) {
                window.dispatchEvent(new CustomEvent('send-to-paraphraser', { detail: text }));
            }
        };
        window.addEventListener('grab-detector-text', handleGrab);
        return () => window.removeEventListener('grab-detector-text', handleGrab);
    }, [text]);

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

    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const aiPercentage = result ? Math.round(result.probability * 100) : 0;

    return (
        <div className="w-full flex flex-col md:flex-row gap-6 animate-fade-in text-gray-200" style={{ height: '600px' }}>

            {/* Left Column: Editor */}
            <div className="flex-1 flex flex-col gap-4 h-full">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl shadow-sm relative flex flex-col overflow-hidden">
                    <div className="absolute top-4 right-4 flex gap-2 z-20">
                        <button
                            onClick={() => setText('')}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors bg-white/5 backdrop-blur-sm"
                            title="Clear text"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>

                    {result && result.sentences && !loading ? (
                        <div
                            className="flex-1 w-full p-10 text-[18px] leading-[1.8] font-normal overflow-y-auto cursor-text"
                            onClick={() => { setResult(null); }}
                        >
                            {result.sentences.map((sentence, idx) => {
                                const prob = sentence.ai_probability;
                                let bgClass = '';
                                if (prob > 0.75) {
                                    bgClass = 'bg-orange-500/30 border-b-2 border-orange-400';
                                } else if (prob > 0.5) {
                                    bgClass = 'bg-orange-400/20 border-b-2 border-orange-400/60';
                                } else if (prob > 0.3) {
                                    bgClass = 'bg-amber-400/10 border-b border-amber-400/40';
                                }
                                return (
                                    <span
                                        key={idx}
                                        className={`${bgClass} rounded-sm px-0.5 transition-all duration-300 ${bgClass ? 'text-gray-100' : 'text-gray-300'}`}
                                        title={`AI probability: ${Math.round(prob * 100)}%`}
                                    >
                                        {sentence.text}{' '}
                                    </span>
                                );
                            })}
                        </div>
                    ) : (
                        <textarea
                            className="flex-1 w-full p-10 text-gray-300 bg-transparent focus:outline-none resize-none text-[18px] leading-[1.6] font-normal placeholder-gray-600 overflow-y-auto"
                            placeholder="Paste your text here to analyze..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={loading}
                            spellCheck={false}
                        />
                    )}

                    <div className="h-16 border-t border-white/5 px-8 flex items-center justify-between bg-[#0f172a]/50 relative z-10 shrink-0">
                        <div className="text-gray-500 text-sm font-semibold tracking-tight">
                            {wordCount} Words
                        </div>

                        <div className="flex items-center gap-6">
                            {result && !loading && (
                                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold animate-fade-in transition-all">
                                    <div className="w-5 h-5 rounded-full border-2 border-emerald-400 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    Analysis complete
                                </div>
                            )}
                            <button
                                onClick={handleDetect}
                                disabled={loading || !text.trim()}
                                className={`
                                    px-10 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 text-[15px]
                                    ${loading || !text.trim()
                                        ? 'bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 shadow-lg shadow-blue-500/20 active:scale-95'}
                                `}
                            >
                                {loading ? 'Analyzing...' : 'Analyze Text'}
                                {!loading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3 animate-shake">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        {error}
                    </div>
                )}
            </div>

            {/* Right Column: Results */}
            <div className="w-full md:w-[420px] flex flex-col gap-6 h-full">
                <div className="bg-white/5 border border-white/10 rounded-2xl shadow-sm p-10 flex flex-col overflow-y-auto flex-1">

                    {/* Top Result Header */}
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-[0.1em] mb-8">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4" /></svg>
                            </div>
                            RewriteGuard Model Version: v5.8.3
                            <div className="flex gap-4 ml-2">
                                <span className="flex items-center gap-1 hover:text-gray-300 transition-colors lowercase font-semibold cursor-pointer"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg> Share</span>
                                <span className="flex items-center gap-1 hover:text-gray-300 transition-colors lowercase font-semibold cursor-pointer"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Download</span>
                            </div>
                        </div>

                        <div className="relative mb-0 animate-scale-in">
                            <span className="text-[72px] font-bold text-white leading-none">{aiPercentage}%</span>
                        </div>
                        <div className="text-gray-400 text-sm font-semibold tracking-tight mt-1">of text is likely AI</div>
                    </div>

                    {/* Bars */}
                    <div className="flex items-end justify-center gap-6 h-36 mb-12 px-12 border-b border-white/5 pb-8">
                        <div className="flex flex-col items-center gap-3 flex-1">
                            <div className="w-full bg-white/5 border border-white/5 rounded-t-lg relative overflow-hidden transition-all duration-1000 ease-out" style={{ height: `${Math.max(5, aiPercentage)}%` }}>
                                <div className="absolute inset-0 bg-orange-400 opacity-60"></div>
                            </div>
                            <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">AI</span>
                        </div>
                        <div className="flex flex-col items-center gap-3 flex-1">
                            <div className="w-full bg-white/5 border border-white/5 rounded-t-lg relative overflow-hidden transition-all duration-1000 ease-out" style={{ height: `${Math.max(5, 100 - aiPercentage)}%` }}>
                                <div className="absolute inset-0 bg-blue-500/20"></div>
                            </div>
                            <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">Human</span>
                        </div>
                    </div>

                    {/* Breakdown Checklist */}
                    <div className="space-y-5 mb-12">
                        <div className="flex items-center justify-between group cursor-default">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
                                <span className="text-[13px] font-bold text-gray-300">AI-generated</span>
                            </div>
                            <div className="text-[13px] font-black text-gray-500 tracking-tighter transition-colors group-hover:text-orange-400">{aiPercentage}%</div>
                        </div>
                        <div className="flex items-center justify-between group cursor-default">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-purple-400/30 border border-purple-400/20"></div>
                                <span className="text-[13px] font-bold text-gray-300">Human-written & AI-refined</span>
                            </div>
                            <div className="text-[13px] font-black text-gray-500 tracking-tighter transition-colors group-hover:text-purple-400">0%</div>
                        </div>
                        <div className="flex items-center justify-between group cursor-default">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-white/10 border-2 border-gray-500"></div>
                                <span className="text-[13px] font-bold text-gray-300">Human-written</span>
                            </div>
                            <div className="text-[13px] font-black text-gray-500 tracking-tighter transition-colors group-hover:text-blue-400">{100 - aiPercentage}%</div>
                        </div>
                    </div>

                    {/* Understanding Section */}
                    <div className="mt-auto border-t border-white/5 pt-8">
                        <button className="flex items-center justify-between w-full text-left mb-4 group">
                            <span className="text-[13px] font-black text-white flex items-center gap-2 tracking-tight">
                                <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 15l7-7 7 7" /></svg>
                                Understanding your results
                            </span>
                        </button>
                        <p className="text-[11px] text-gray-500 font-medium leading-[1.7] tracking-tight">
                            Our AI detector flags text that may be AI-generated. Use your best judgment when reviewing results. Never rely on AI detection alone to make decisions that could impact someone's career or academic standing.
                        </p>
                    </div>
                </div>
            </div>

            {/* Float Highlight indicator */}
            {result && result.sentences && result.sentences.some(s => s.ai_probability > 0.6) && (
                <div className="fixed bottom-12 right-12 bg-[#1e293b] px-6 py-3 rounded-full shadow-2xl border border-white/10 flex items-center gap-3 z-50 animate-fade-in-up">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Potential AI detected</span>
                </div>
            )}
        </div>
    );
}

export default Detector;
