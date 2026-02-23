import { useState } from 'react';
import AuthForm from './AuthForm';

interface LandingPageProps {
    // No props needed for now
}

export default function LandingPage({ }: LandingPageProps) {
    const [view, setView] = useState<'home' | 'pricing' | 'auth'>('home');

    if (view === 'auth') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in bg-[#0f172a]">
                <button
                    onClick={() => setView('home')}
                    className="mb-8 text-gray-400 hover:text-white flex items-center gap-2 transition-colors group"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                </button>
                <AuthForm />
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white overflow-hidden bg-[#0f172a]">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-50 max-w-7xl mx-auto px-6 py-8 flex justify-between items-center bg-[#0f172a]/80 backdrop-blur-md sticky top-0 border-b border-white/5">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight">
                        RewriteGuard
                    </span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <button onClick={() => setView('home')} className={`hover:text-white transition-colors ${view === 'home' ? 'text-white' : ''}`}>Features</button>
                    <button onClick={() => setView('pricing')} className={`hover:text-white transition-colors ${view === 'pricing' ? 'text-white' : ''}`}>Pricing</button>
                    <button
                        onClick={() => setView('auth')}
                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all ml-4"
                    >
                        Sign In
                    </button>
                </div>
            </nav>

            {view === 'home' ? (
                /* Home / Features View */
                <main className="relative z-10">
                    {/* Hero Section */}
                    <div className="max-w-7xl mx-auto px-6 py-20 pb-32 text-center">
                        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium animate-fade-in">
                            ✨ Advanced AI Text Protection
                        </div>
                        <h1 className="text-6xl md:text-8xl font-extrabold mb-8 tracking-tighter leading-[1.1] animate-fade-in-up">
                            Secure Your Content in the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400">
                                Age of AI
                            </span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            Detect AI-generated text and paraphrase content with military-grade accuracy.
                            RewriteGuard uses state-of-the-art ML models to keep your writing authentic.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <button
                                onClick={() => setView('auth')}
                                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                Get Started for Free
                            </button>
                            <button
                                onClick={() => setView('pricing')}
                                className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-lg backdrop-blur-sm transition-all"
                            >
                                View Plans
                            </button>
                        </div>

                        {/* Dashboard Preview Mockup */}
                        <div className="mt-24 relative max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-[2rem] blur-2xl opacity-50"></div>
                            <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden aspect-video flex items-center justify-center p-8 lg:p-12 group">
                                <div className="w-full h-full rounded-xl bg-slate-900/50 border border-white/5 p-6 flex flex-col gap-4">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                            <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                                            <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                                        </div>
                                        <div className="h-4 w-32 bg-white/5 rounded"></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-2">
                                        <div className="h-24 bg-white/5 rounded-xl animate-pulse"></div>
                                        <div className="h-24 bg-white/5 rounded-xl animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="h-24 bg-white/5 rounded-xl animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                    <div className="flex-1 bg-white/5 rounded-xl flex items-center justify-center relative overflow-hidden">
                                        <span className="text-white/20 font-bold text-4xl select-none group-hover:scale-110 transition-transform duration-700">PREVIEW</span>
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-500/10 to-transparent"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <section id="features" className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl font-bold mb-4">Precision-Engineered Tools</h2>
                            <p className="text-gray-400">Everything you need to master AI-era content creation.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 text-left">
                            <div className="group p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/[0.08] hover:border-white/20 transition-all">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Advanced AI Detection</h3>
                                <p className="text-gray-400 leading-relaxed mb-6">
                                    Powered by specialized DeBERTa ML models trained on millions of samples.
                                    Distinguish between human writing and AI generators like GPT-4 and Claude 3 with 99%+ confidence.
                                </p>
                                <div className="flex items-center gap-2 text-blue-400 font-medium">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                                    Real-time analysis
                                </div>
                            </div>
                            <div className="group p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/[0.08] hover:border-white/20 transition-all">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Intelligent Paraphrasing</h3>
                                <p className="text-gray-400 leading-relaxed mb-6">
                                    Transform your text with 5 distinct writing modes. From academic formality to creative flare,
                                    our T5-based paraphraser ensures your message is clear, unique, and natural.
                                </p>
                                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                    5 adaptive modes
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            ) : (
                /* Pricing View */
                <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 animate-fade-in-up">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-extrabold mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-xl text-gray-400">Choose the plan that's right for your content needs.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 flex flex-col hover:bg-slate-800/60 transition-all">
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-2">Free</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-5xl font-extrabold">$0</span>
                                    <span className="text-gray-400">/forever</span>
                                </div>
                                <p className="text-gray-400">Perfect for trying out our tools.</p>
                            </div>
                            <div className="space-y-4 mb-10 flex-1">
                                <FeatureItem text="1,000 words / day" />
                                <FeatureItem text="Standard AI Detection" />
                                <FeatureItem text="Basic Paraphrasing" />
                                <FeatureItem text="Community Support" />
                            </div>
                            <button
                                onClick={() => setView('auth')}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all"
                            >
                                Get Started
                            </button>
                        </div>

                        {/* Premium Plan */}
                        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all">
                            <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-xs font-bold uppercase tracking-widest rounded-bl-xl">Popular</div>
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-5xl font-extrabold">$9.99</span>
                                    <span className="text-gray-400">/mo</span>
                                </div>
                                <p className="text-gray-400">For power users and professionals.</p>
                            </div>
                            <div className="space-y-4 mb-10 flex-1">
                                <FeatureItem text="10,000 words / day" />
                                <FeatureItem text="Priority AI Processing" />
                                <FeatureItem text="All 5 Paraphrasing Modes" />
                                <FeatureItem text="Priority Support" />
                                <FeatureItem text="No Daily Limits (soon)" />
                            </div>
                            <button
                                onClick={() => setView('auth')}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all text-white"
                            >
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                </main>
            )}

            {/* Common Section: Stats / Proof */}
            <section className="bg-white/[0.02] border-y border-white/5 py-24 relative overflow-hidden z-10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
                    <div>
                        <div className="text-4xl font-extrabold text-white mb-2">99%</div>
                        <div className="text-sm text-gray-400 uppercase tracking-widest">Detection Accuracy</div>
                    </div>
                    <div>
                        <div className="text-4xl font-extrabold text-white mb-2">{'<'} 1s</div>
                        <div className="text-sm text-gray-400 uppercase tracking-widest">Processing Time</div>
                    </div>
                    <div>
                        <div className="text-4xl font-extrabold text-white mb-2">5+</div>
                        <div className="text-sm text-gray-400 uppercase tracking-widest">Rewrite Modes</div>
                    </div>
                    <div>
                        <div className="text-4xl font-extrabold text-white mb-2">10k+</div>
                        <div className="text-sm text-gray-400 uppercase tracking-widest">Users Trusted</div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-6 py-20 text-center border-t border-white/5 relative z-10">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <span className="font-bold">RewriteGuard</span>
                    </div>
                    <p className="text-gray-500 text-sm max-w-md">
                        The ultimate platform for AI-era content verification and enhancement.
                        © 2026 RewriteGuard. All rights reserved.
                    </p>
                    <div className="flex gap-6 mt-4">
                        <button onClick={() => setView('auth')} className="text-sm text-gray-500 hover:text-white transition-colors">Documentation</button>
                        <button onClick={() => setView('auth')} className="text-sm text-gray-500 hover:text-white transition-colors">Privacy Policy</button>
                        <button onClick={() => setView('auth')} className="text-sm text-gray-500 hover:text-white transition-colors">Contact Support</button>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <span className="text-gray-300">{text}</span>
        </div>
    );
}
