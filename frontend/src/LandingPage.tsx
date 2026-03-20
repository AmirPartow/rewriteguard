import { useState, useEffect } from 'react';
import { API } from './config';
import AuthForm from './AuthForm';
import ContactSupport from './ContactSupport';
import Footer from './components/Footer';
import LogoHomeButton from './components/LogoHomeButton';
import AccountMenu from './components/AccountMenu';
import PricingView from './components/PricingView';

interface LandingPageProps {
    onShowPolicy: () => void;
    onPrivacyClick: () => void;
    onTermsClick: () => void;
    onLegalClick: () => void;
    onGuestEntry?: () => void;
    onDashboardEntry?: () => void;
    isAuthenticated?: boolean;
}

export default function LandingPage({ onShowPolicy, onPrivacyClick, onTermsClick, onLegalClick, onGuestEntry, onDashboardEntry, isAuthenticated }: LandingPageProps) {
    const [view, setView] = useState<'home' | 'pricing' | 'auth' | 'contact' | 'help'>('home');
    const [userCount, setUserCount] = useState<string>("10,000+");

    useEffect(() => {
        fetch(`${API.AUTH}/users/count`)
            .then(res => res.json())
            .then(data => {
                if (data.total_users) {
                    setUserCount(data.total_users.toLocaleString() + "+");
                }
            })
            .catch(err => console.error("Could not fetch user count", err));

        const handlePopState = (e: PopStateEvent) => {
            if (e.state && e.state.view) {
                setView(e.state.view);
            } else {
                setView('home');
            }
        };

        const handleOpenContact = () => navigateTo('contact');
        window.addEventListener('popstate', handlePopState);
        window.addEventListener('open-contact', handleOpenContact);
        
        // Initial state
        if (!window.history.state || !window.history.state.view) {
            window.history.replaceState({ view: 'home' }, '', window.location.pathname);
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('open-contact', handleOpenContact);
        };
    }, []);

    const navigateTo = (newView: typeof view) => {
        if (newView === view) return;
        window.history.pushState({ view: newView }, '', window.location.pathname);
        setView(newView);
    };


    useEffect(() => {
        window.scrollTo(0, 0);
    }, [view]);

    if (view === 'help') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] animate-fade-in transition-colors">
                <ContactSupport onBack={() => navigateTo('home')} mode="help" />
                <Footer 
                    onShowPolicy={onShowPolicy} 
                    onPrivacyClick={onPrivacyClick} 
                    onTermsClick={onTermsClick} 
                    onLegalClick={onLegalClick} 
                    onContactClick={() => navigateTo('contact')} 
                    onHelpClick={() => navigateTo('help')}
                />
            </div>
        );
    }

    if (view === 'contact') {
        return (
            <div className="min-h-screen flex flex-col items-center py-20 px-4 animate-fade-in bg-slate-50 dark:bg-[#0f172a] transition-colors">
                <div className="mb-12 self-start w-full px-6">
                    <LogoHomeButton onClick={() => navigateTo('home')} />
                </div>
                <div className="w-full flex-grow">
                    <ContactSupport onBack={() => navigateTo('home')} mode="contact" />
                </div>
                <Footer 
                    onShowPolicy={onShowPolicy} 
                    onPrivacyClick={onPrivacyClick} 
                    onTermsClick={onTermsClick} 
                    onLegalClick={onLegalClick} 
                    onContactClick={() => navigateTo('contact')} 
                    onHelpClick={() => navigateTo('help')}
                />
            </div>
        );
    }

    if (view === 'auth') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in bg-slate-50 dark:bg-[#0f172a] transition-colors">
                <div className="mb-8">
                    <LogoHomeButton onClick={() => navigateTo('home')} />
                </div>
                <div className="w-full flex-grow flex items-center justify-center">
                    <AuthForm onPrivacyClick={onPrivacyClick} onTermsClick={onTermsClick} />
                </div>
                <Footer 
                    onShowPolicy={onShowPolicy} 
                    onPrivacyClick={onPrivacyClick} 
                    onTermsClick={onTermsClick} 
                    onLegalClick={onLegalClick} 
                    onContactClick={() => navigateTo('contact')} 
                    onHelpClick={() => navigateTo('help')}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen text-slate-900 dark:text-white bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-50 w-full px-6 md:px-12 py-6 flex justify-between items-center bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md sticky top-0 border-b border-gray-200 dark:border-white/5 transition-colors">
                <LogoHomeButton onClick={() => navigateTo('home')} />
                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-500 dark:text-gray-400">
                <button onClick={() => navigateTo('home')} className={`hover:text-blue-600 dark:hover:text-white transition-colors ${view === 'home' ? 'text-blue-600 dark:text-white' : ''}`}>Features</button>
                <button onClick={() => { navigateTo('home'); setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-blue-600 dark:hover:text-white transition-colors">FAQ</button>
                <button onClick={() => navigateTo('pricing')} className={`hover:text-blue-600 dark:hover:text-white transition-colors ${view === 'pricing' ? 'text-blue-600 dark:text-white' : ''}`}>Pricing</button>
                    </div>
                    
                    <div className="flex items-center gap-4 border-l border-gray-200 dark:border-white/10 ml-2 pl-6">
                        <AccountMenu 
                            onLoginClick={() => navigateTo('auth')}
                            onContactClick={() => navigateTo('contact')}
                            onHelpClick={() => navigateTo('help')}
                        />
                        {isAuthenticated && (
                             <button
                                onClick={() => onDashboardEntry && onDashboardEntry()}
                                className="hidden sm:block px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
                            >
                                Dashboard
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {view === 'home' ? (
                /* Home / Features View */
                <main className="relative z-10">
                    {/* Hero Section */}
                    <div className="w-full px-6 md:px-12 py-24 pb-32 text-center">
                        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-500/10 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-bold animate-fade-in shadow-sm">
                            ✨ Advanced AI Text Protection
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[1.1] animate-fade-in-up text-slate-900 dark:text-white">
                            Secure Your Content in the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 dark:from-blue-400 dark:via-purple-500 dark:to-emerald-400">
                                Age of AI
                            </span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-slate-600 dark:text-gray-400 mb-12 leading-relaxed animate-fade-in-up font-medium" style={{ animationDelay: '0.1s' }}>
                            Detect AI-generated text and paraphrase content with military-grade accuracy.
                            RewriteGuard uses state-of-the-art ML models to keep your writing authentic.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            {isAuthenticated ? (
                                <button
                                    onClick={() => onDashboardEntry && onDashboardEntry()}
                                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all text-white"
                                >
                                    Go to Dashboard
                                </button>
                            ) : (
                                <button
                                    onClick={() => onGuestEntry ? onGuestEntry() : setView('auth')}
                                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Get Started for Free
                                </button>
                            )}
                            <button
                                onClick={() => setView('pricing')}
                                className="px-10 py-4 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl font-bold text-lg backdrop-blur-sm transition-all text-slate-900 dark:text-white shadow-sm"
                            >
                                View Plans
                            </button>
                        </div>


                        {/* Dashboard Preview Mockup */}
                        <div className="mt-24 relative w-full px-0 md:px-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-[2rem] blur-2xl opacity-50"></div>
                            <div className="relative bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden aspect-video flex flex-col p-4 lg:p-6 group transition-colors">
                                {/* Browser Chrome */}
                                <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-4 mb-6 transition-colors">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/30 dark:bg-red-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-500/30 dark:bg-amber-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-500/30 dark:bg-emerald-500/50"></div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-2 w-24 bg-gray-100 dark:bg-white/5 rounded-full"></div>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                                    </div>
                                </div>

                                {/* Mock Dashboard Content */}
                                <div className="flex-1 flex gap-6 overflow-hidden">
                                    {/* Sidebar Mockup */}
                                    <div className="hidden md:flex flex-col gap-4 w-48 border-r border-gray-100 dark:border-white/5 pr-6 transition-colors">
                                        <div className="h-8 w-full bg-blue-500/20 rounded-lg flex items-center px-3 gap-2">
                                            <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                                            <div className="h-2 w-16 bg-blue-400/50 rounded"></div>
                                        </div>
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-8 w-full bg-gray-50 dark:bg-white/5 rounded-lg flex items-center px-3 gap-2 transition-colors">
                                                <div className="w-3 h-3 bg-gray-300 dark:bg-white/20 rounded-sm"></div>
                                                <div className="h-2 w-20 bg-gray-200 dark:bg-white/10 rounded"></div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Main Area Mockup */}
                                    <div className="flex-1 flex flex-col gap-6">
                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl group/card hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all">
                                                <div className="text-xl mb-1">📝</div>
                                                <div className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">1,420</div>
                                                <div className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-wider font-bold">Words Today</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl group/card hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all">
                                                <div className="text-xl mb-1">✨</div>
                                                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 transition-colors">99.4%</div>
                                                <div className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-wider font-bold">Accuracy</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl group/card hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all">
                                                <div className="text-xl mb-1">⚡</div>
                                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors">0.8s</div>
                                                <div className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-wider font-bold">Speed</div>
                                            </div>
                                        </div>

                                        {/* Activity Chart Mockup */}
                                        <div className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group-hover:scale-[1.01] transition-all duration-700">
                                            <div className="flex justify-between items-center">
                                                <div className="h-3 w-32 bg-gray-200 dark:bg-white/10 rounded transition-colors"></div>
                                                <div className="h-3 w-16 bg-gray-100 dark:bg-white/5 rounded text-[10px] flex items-center justify-center text-slate-400 dark:text-gray-400 transition-colors">7 Days</div>
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
                    <section id="features" className="w-full px-6 md:px-12 py-32 border-t border-gray-200 dark:border-white/5 bg-white/50 dark:bg-transparent transition-colors">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl font-black mb-4 text-slate-900 dark:text-white transition-colors">Precision-Engineered Tools</h2>
                            <p className="text-slate-500 dark:text-gray-400 font-medium transition-colors">Everything you need to master AI-era content creation.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 text-left">
                            <div className="group p-10 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2.5rem] hover:bg-gray-50 dark:hover:bg-white/[0.08] hover:border-blue-200 dark:hover:border-white/20 transition-all shadow-sm hover:shadow-xl">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black mb-4 text-slate-900 dark:text-white transition-colors">Advanced AI Detection</h3>
                                <p className="text-slate-600 dark:text-gray-400 leading-relaxed mb-8 font-medium transition-colors">
                                    Powered by specialized DeBERTa ML models trained on millions of samples.
                                    Distinguish between human writing and AI generators like GPT-4 and Claude 3 with 99%+ confidence.
                                </p>
                                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-bold">
                                    <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></span>
                                    Real-time analysis
                                </div>
                            </div>
                            <div className="group p-10 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2.5rem] hover:bg-gray-50 dark:hover:bg-white/[0.08] hover:border-emerald-200 dark:hover:border-white/20 transition-all shadow-sm hover:shadow-xl">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black mb-4 text-slate-900 dark:text-white transition-colors">Intelligent Paraphrasing</h3>
                                <p className="text-slate-600 dark:text-gray-400 leading-relaxed mb-8 font-medium transition-colors">
                                    Transform your text with 5 distinct writing modes. From academic formality to creative flare,
                                    our T5-based paraphraser ensures your message is clear, unique, and natural.
                                </p>
                                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold">
                                    <span className="w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-pulse"></span>
                                    5 adaptive modes
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section id="faq" className="w-full px-6 md:px-12 py-32 border-t border-gray-200 dark:border-white/5 bg-white/30 dark:bg-transparent transition-colors">
                        <div className="text-center mb-16">
                            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-purple-500/10 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 text-sm font-bold shadow-sm">
                                ❓ Frequently Asked Questions
                            </div>
                            <h2 className="text-4xl font-black mb-4 text-slate-900 dark:text-white transition-colors">Got Questions? We've Got Answers</h2>
                            <p className="text-slate-500 dark:text-gray-400 font-medium transition-colors">Everything you need to know about RewriteGuard.</p>
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
                /* Pricing View with Details */
                <PricingView onAuthRequest={() => setView('auth')} />
            )}

            {/* Common Section: Stats / Proof */}
            <section className="bg-gray-100/50 dark:bg-white/[0.02] border-y border-gray-200 dark:border-white/5 py-24 relative overflow-hidden z-10 transition-colors">
                <div className="w-full px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
                    <div>
                        <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 transition-colors">99%</div>
                        <div className="text-[10px] md:text-xs text-slate-400 dark:text-gray-500 uppercase tracking-widest font-bold transition-colors">Detection Accuracy</div>
                    </div>
                    <div>
                        <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 transition-colors">{'<'} 1s</div>
                        <div className="text-[10px] md:text-xs text-slate-400 dark:text-gray-500 uppercase tracking-widest font-bold transition-colors">Processing Time</div>
                    </div>
                    <div>
                        <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 transition-colors">5+</div>
                        <div className="text-[10px] md:text-xs text-slate-400 dark:text-gray-500 uppercase tracking-widest font-bold transition-colors">Rewrite Modes</div>
                    </div>
                    <div>
                        <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 transition-colors">{userCount}</div>
                        <div className="text-[10px] md:text-xs text-slate-400 dark:text-gray-500 uppercase tracking-widest font-bold transition-colors">Users Trusted</div>
                    </div>
                </div>
            </section>

            {/* Shared Footer */}
            <Footer 
               onShowPolicy={onShowPolicy} 
               onPrivacyClick={onPrivacyClick} 
               onTermsClick={onTermsClick} 
               onLegalClick={onLegalClick} 
               onContactClick={() => setView('contact')} 
               onHelpClick={() => setView('help')}
           />
        </div>
    );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-all shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left cursor-pointer"
            >
                <span className="text-lg font-bold text-slate-900 dark:text-white pr-4 transition-colors">{question}</span>
                <svg
                    className={`w-5 h-5 text-slate-400 dark:text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <p className="px-6 pb-6 text-slate-600 dark:text-gray-400 leading-relaxed font-medium transition-colors">{answer}</p>
            </div>
        </div>
    );
}
