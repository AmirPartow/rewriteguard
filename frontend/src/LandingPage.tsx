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
                    <button onClick={() => { setView('home'); setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-white transition-colors">FAQ</button>
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
                            <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden aspect-video flex flex-col p-4 lg:p-6 group">
                                {/* Browser Chrome */}
                                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-2 w-24 bg-white/5 rounded-full"></div>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                                    </div>
                                </div>

                                {/* Mock Dashboard Content */}
                                <div className="flex-1 flex gap-6 overflow-hidden">
                                    {/* Sidebar Mockup */}
                                    <div className="hidden md:flex flex-col gap-4 w-48 border-r border-white/5 pr-6">
                                        <div className="h-8 w-full bg-blue-500/20 rounded-lg flex items-center px-3 gap-2">
                                            <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                                            <div className="h-2 w-16 bg-blue-400/50 rounded"></div>
                                        </div>
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-8 w-full bg-white/5 rounded-lg flex items-center px-3 gap-2">
                                                <div className="w-3 h-3 bg-white/20 rounded-sm"></div>
                                                <div className="h-2 w-20 bg-white/10 rounded"></div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Main Area Mockup */}
                                    <div className="flex-1 flex flex-col gap-6">
                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl group/card hover:bg-white/[0.08] transition-colors">
                                                <div className="text-xl mb-1">📝</div>
                                                <div className="text-2xl font-bold text-white">1,420</div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Words Today</div>
                                            </div>
                                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl group/card hover:bg-white/[0.08] transition-colors">
                                                <div className="text-xl mb-1">✨</div>
                                                <div className="text-2xl font-bold text-emerald-400">99.4%</div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Accuracy</div>
                                            </div>
                                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl group/card hover:bg-white/[0.08] transition-colors">
                                                <div className="text-xl mb-1">⚡</div>
                                                <div className="text-2xl font-bold text-blue-400">0.8s</div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Speed</div>
                                            </div>
                                        </div>

                                        {/* Activity Chart Mockup */}
                                        <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group-hover:scale-[1.01] transition-transform duration-700">
                                            <div className="flex justify-between items-center">
                                                <div className="h-3 w-32 bg-white/10 rounded"></div>
                                                <div className="h-3 w-16 bg-white/5 rounded text-[10px] flex items-center justify-center text-gray-400">7 Days</div>
                                            </div>
                                            <div className="flex-1 flex items-end gap-2 px-2">
                                                {[40, 70, 45, 90, 65, 80, 55, 75, 50, 85].map((h, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex-1 bg-gradient-to-t from-blue-600/40 to-blue-400/60 rounded-t-sm animate-fade-in-up"
                                                        style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }}
                                                    ></div>
                                                ))}
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none"></div>
                                        </div>
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

                    {/* FAQ Section (matches FAQPage structured data for Google rich results) */}
                    <section id="faq" className="max-w-4xl mx-auto px-6 py-32 border-t border-white/5">
                        <div className="text-center mb-16">
                            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
                                ❓ Frequently Asked Questions
                            </div>
                            <h2 className="text-4xl font-bold mb-4">Got Questions? We've Got Answers</h2>
                            <p className="text-gray-400">Everything you need to know about RewriteGuard.</p>
                        </div>
                        <div className="space-y-4">
                            <FAQItem
                                question="What is RewriteGuard?"
                                answer="RewriteGuard is an advanced AI content detection and paraphrasing platform. It uses DeBERTa machine learning models to detect AI-generated text from tools like GPT-4, Claude, and Gemini with 99%+ accuracy. It also offers intelligent paraphrasing in 5 different writing styles."
                            />
                            <FAQItem
                                question="How accurate is RewriteGuard's AI detection?"
                                answer="RewriteGuard achieves 99%+ accuracy in detecting AI-generated text. Our models are trained on millions of human and AI text samples, and are continuously updated to detect the latest AI writing tools including GPT-4, Claude 3, and Gemini."
                            />
                            <FAQItem
                                question="Is RewriteGuard free to use?"
                                answer="Yes! RewriteGuard offers a free plan with 1,000 words per day, standard AI detection, and basic paraphrasing. For power users, our Premium plan at $9.99/month offers 10,000 words per day, priority processing, and all 5 paraphrasing modes."
                            />
                            <FAQItem
                                question="What paraphrasing modes does RewriteGuard offer?"
                                answer="RewriteGuard offers 5 paraphrasing modes: Standard (balanced rewrite), Formal (professional tone), Casual (conversational style), Creative (unique expression), and Concise (brief and clear). Each mode is powered by a T5-based language model."
                            />
                            <FAQItem
                                question="Can RewriteGuard detect GPT-4 and Claude text?"
                                answer="Yes, RewriteGuard can detect text generated by GPT-4, GPT-3.5, Claude 3, Gemini, and other major AI writing tools. Our DeBERTa-based detection models are regularly retrained on the latest AI outputs to maintain high accuracy."
                            />
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
            <footer className="max-w-7xl mx-auto px-6 py-16 border-t border-white/5 relative z-10 w-full">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Premium */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Premium</h3>
                        <ul className="space-y-4">
                            <li><button onClick={() => setView('pricing')} className="text-gray-400 hover:text-white transition-colors text-sm">Plan Details</button></li>
                            <li><button onClick={() => setView('pricing')} className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</button></li>
                            <li><button onClick={() => setView('auth')} className="text-gray-400 hover:text-white transition-colors text-sm">For Teams</button></li>
                            <li><button onClick={() => setView('auth')} className="text-gray-400 hover:text-white transition-colors text-sm">Affiliates</button></li>
                            <li><button onClick={() => setView('auth')} className="text-gray-400 hover:text-white transition-colors text-sm">Request a Demo</button></li>
                        </ul>
                    </div>
                    {/* Tools */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Tools</h3>
                        <ul className="space-y-4">
                            <li><button onClick={() => setView('auth')} className="text-gray-400 flex items-center gap-2 hover:text-white transition-colors text-sm"><span className="text-gray-600">›</span> AI Detector</button></li>
                            <li><button onClick={() => setView('auth')} className="text-gray-400 flex items-center gap-2 hover:text-white transition-colors text-sm"><span className="text-gray-600">›</span> Standard Paraphraser</button></li>
                            <li><button onClick={() => setView('auth')} className="text-gray-400 flex items-center gap-2 hover:text-white transition-colors text-sm"><span className="text-gray-600">›</span> Formal Rewriter</button></li>
                            <li><button onClick={() => setView('auth')} className="text-gray-400 flex items-center gap-2 hover:text-white transition-colors text-sm"><span className="text-gray-600">›</span> Casual Rewriter</button></li>
                            <li><button onClick={() => setView('auth')} className="text-gray-400 flex items-center gap-2 hover:text-white transition-colors text-sm"><span className="text-gray-600">›</span> Creative Mode</button></li>
                        </ul>
                    </div>
                    {/* Company */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Company</h3>
                        <ul className="space-y-4">
                            <li><button onClick={() => setView('auth')} className="text-gray-400 hover:text-white transition-colors text-sm">About</button></li>
                            <li><button onClick={() => setView('auth')} className="text-gray-400 hover:text-white transition-colors text-sm">Trust Center</button></li>
                            <li><button onClick={() => setView('auth')} className="text-gray-400 hover:text-white transition-colors text-sm">Careers</button></li>
                            <li><button onClick={() => setView('auth')} className="text-gray-400 hover:text-white transition-colors text-sm">Help Center</button></li>
                            <li><button onClick={() => setView('auth')} className="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</button></li>
                        </ul>
                    </div>
                    {/* Socials */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Follow us on social</h3>
                        <div className="flex gap-4">
                            {/* Instagram */}
                            <a href="#" className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                            </a>
                            {/* Tiktok */}
                            <a href="#" className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white hover:opacity-80 transition-opacity border border-white/20">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.96-.5 3.96-1.72 5.39-1.2 1.43-3.1 2.16-5.02 2.15-2.03 0-4.04-.67-5.38-2.14-1.34-1.48-1.93-3.64-1.57-5.59.39-2.08 1.83-3.87 3.73-4.7 1.87-.85 4.12-.91 6.08-.24v4.2c-.3-.21-.66-.35-1.03-.43-1.4-.33-2.92.01-3.88 1.05-.98 1.08-1.07 2.89-.18 4.05.88 1.14 2.59 1.5 4 .9.4-.17.78-.42 1.09-.75.33-.36.56-.81.67-1.3.11-.47.1-1.02.1-1.53V.02z" /></svg>
                            </a>
                            {/* YouTube */}
                            <a href="#" className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                            </a>
                            {/* LinkedIn */}
                            <a href="#" className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                            </a>
                            {/* X (Twitter) */}
                            <a href="#" className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white hover:opacity-80 transition-opacity border border-white/20">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Trustpilot Review Row */}
                <div className="pt-8 border-t border-white/5 flex flex-col items-center">
                    <a href="https://trustpilot.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white hover:bg-gray-50 transition-colors px-6 py-3 rounded-full shadow-xl hover:scale-105 transform duration-300 w-fit">
                        <span className="text-gray-900 font-semibold text-sm">Excellent</span>
                        <div className="flex text-[#00b67a]">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                        </div>
                        <span className="text-gray-600 text-sm border-b border-gray-600">8,794 reviews on</span>
                        <div className="flex items-center gap-1 text-gray-900 font-bold">
                            <svg className="w-5 h-5 text-[#00b67a]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                            <span>Trustpilot</span>
                        </div>
                    </a>
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

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.08] transition-all">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left cursor-pointer"
            >
                <span className="text-lg font-semibold text-white pr-4">{question}</span>
                <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <p className="px-6 pb-6 text-gray-400 leading-relaxed">{answer}</p>
            </div>
        </div>
    );
}

