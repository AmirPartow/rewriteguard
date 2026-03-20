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
    const [activeSegment, setActiveSegment] = useState<number>(0);

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

                        {/* 1. Value Proposition Section: AI that writes with you */}
                        <div className="mt-32 max-w-6xl mx-auto px-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white leading-tight">
                                    AI that protects your voice, <br />
                                    <span className="text-blue-600 dark:text-blue-400">doesn't replace it</span>
                                </h2>
                                <p className="max-w-3xl mx-auto text-lg text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
                                    RewriteGuard works alongside you to ensure your writing remains authentic, professional, and undetectable—in a fraction of the time. Welcome to a more secure future of writing.
                                </p>
                                <button
                                    onClick={() => navigateTo('auth')}
                                    className="mt-8 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full transition-all shadow-lg hover:scale-105 active:scale-95"
                                >
                                    Sign up now. It's free!
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-16 items-center">
                                <div className="space-y-12">
                                    <div className="group transition-all">
                                        <h3 className="text-2xl font-black mb-4 flex items-center gap-3 text-slate-900 dark:text-white">
                                            <span className="w-10 h-10 flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">🛡️</span>
                                            Clear, authentic communication
                                        </h3>
                                        <p className="text-lg text-slate-600 dark:text-gray-400 leading-relaxed font-medium">
                                            Never worry about AI flags again. RewriteGuard straightens your tone, eliminates robotic patterns, and preserves your unique intent.
                                        </p>
                                    </div>
                                    <div className="group transition-all">
                                        <h3 className="text-2xl font-black mb-4 flex items-center gap-3 text-slate-900 dark:text-white">
                                            <span className="w-10 h-10 flex items-center justify-center bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all">✨</span>
                                            Better results, faster delivery
                                        </h3>
                                        <p className="text-lg text-slate-600 dark:text-gray-400 leading-relaxed font-medium">
                                            Humanize your text with one click. Choose from specialized modes to match your context and bypass even the most aggressive AI detectors.
                                        </p>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                                    <img 
                                        src="/academic_preview_mockup_1773986647445.png" 
                                        alt="AI Detection Preview" 
                                        className="relative w-full rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 hover:scale-[1.01] transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 shadow-lg animate-bounce">
                                        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">✨ 99% Human Verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Tabbed Audience Section */}
                        <div className="mt-40 mb-20 section-audience animate-fade-in" style={{ animationDelay: '0.5s' }}>
                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-12">Perfect any project with RewriteGuard</h2>
                                <div className="flex flex-wrap justify-center gap-2 md:gap-4 p-2 bg-slate-100 dark:bg-white/5 rounded-full max-w-fit mx-auto border border-gray-200 dark:border-white/10">
                                    {['Professional Writers', 'Students', 'Content Creators', 'Academic Researchers'].map((segment, idx) => (
                                        <button
                                            key={segment}
                                            onClick={() => setActiveSegment(idx)}
                                            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeSegment === idx ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-white shadow-md' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
                                        >
                                            {segment}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center min-h-[500px]">
                                <div className="space-y-8 animate-fade-in-up" key={activeSegment}>
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">
                                        {activeSegment === 0 && "Write with professional authority."}
                                        {activeSegment === 1 && "Excel in your academic journey."}
                                        {activeSegment === 2 && "Ignite your content flow."}
                                        {activeSegment === 3 && "Craft stellar research papers."}
                                    </h3>
                                    <p className="text-xl text-slate-600 dark:text-gray-400 leading-relaxed font-medium">
                                        {activeSegment === 0 && "Polish your emails, reports, and presentations. RewriteGuard ensures your professional voice is sharp, clear, and fully authentic."}
                                        {activeSegment === 1 && "Submit your essays with confidence. Detect AI footprints and refine your work to maintain the highest standards of originality."}
                                        {activeSegment === 2 && "Create content that commands attention. Humanize AI-generated drafts to keep your personal touch while saving hours of effort."}
                                        {activeSegment === 3 && "Elevate your research process. Ensure every citation, analysis, and discovery is presented in your own unmistakable voice."}
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        {activeSegment === 0 && ['Formal Mode', 'Clarity Plus', 'Professional Bias'].map(tag => <span key={tag} className="px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-xs uppercase tracking-wider border border-blue-200/50 dark:border-blue-500/20">{tag}</span>)}
                                        {activeSegment === 1 && ['Originality Check', 'Essay Smoother', 'Student Lite'].map(tag => <span key={tag} className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-xs uppercase tracking-wider border border-emerald-200/50 dark:border-emerald-500/20">{tag}</span>)}
                                        {activeSegment === 2 && ['Voice Preserver', 'Creative Flare', 'Bulk Humanize'].map(tag => <span key={tag} className="px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl font-bold text-xs uppercase tracking-wider border border-purple-200/50 dark:border-purple-500/20">{tag}</span>)}
                                        {activeSegment === 3 && ['Academic Depth', 'Citation Safe', 'Research Polish'].map(tag => <span key={tag} className="px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl font-bold text-xs uppercase tracking-wider border border-amber-200/50 dark:border-amber-500/20">{tag}</span>)}
                                    </div>
                                    <button
                                        onClick={() => navigateTo('auth')}
                                        className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20 group"
                                    >
                                        Try it for free <span className="inline-block group-hover:translate-x-1 transition-transform ml-2">→</span>
                                    </button>
                                </div>

                                <div className="relative group animate-fade-in" style={{ animationDuration: '0.8s' }} key={`${activeSegment}-img`}>
                                    <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-[3rem] blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                    <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                                        <img 
                                            src={
                                                activeSegment === 0 ? "/brand_protection_mockup_1773986690362.png" :
                                                activeSegment === 1 ? "/student_essay_mockup_1773986659703.png" :
                                                activeSegment === 2 ? "/creator_voice_mockup_1773986673586.png" :
                                                "/academic_preview_mockup_1773986647445.png"
                                            } 
                                            alt="Segment Mockup" 
                                            className="w-full h-auto rounded-xl shadow-lg border border-gray-100 dark:border-white/5 shadow-blue-500/5"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Testimonials Section: Why people love us */}
                        <div className="mt-40 bg-slate-100/50 dark:bg-white/[0.02] py-32 animate-fade-in border-y border-gray-200 dark:border-white/5">
                            <div className="max-w-7xl mx-auto px-6 text-center">
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-20 tracking-tight">Why writers love RewriteGuard</h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {[
                                        { name: "Jerry Keszka", role: "Content Creator", text: "As someone who writes daily for my brand, keeping the voice human is vital. RewriteGuard saves me time and money while keeping my quality elite." },
                                        { name: "Daniel Völk", role: "Published Author", text: "Whenever I struggle with repetitive phrasing, I use the humanizer. It generates unique sentences while maintaining the same story context." },
                                        { name: "Akshita Thakur", role: "Language Trainer", text: "I've been teaching writing for years, and I've always needed a tool to simplify complex logic into natural, flowing English. This is it." },
                                        { name: "Danisha Verma", role: "Student", text: "RewriteGuard has been a game-changer for my thesis. It's an indispensable tool for any student looking to improve their writing standards." }
                                    ].map((testi, i) => (
                                        <div key={i} className="flex flex-col p-8 bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all hover:bg-gray-50 dark:hover:bg-white/[0.07]">
                                            <p className="text-slate-600 dark:text-gray-400 italic mb-8 flex-grow leading-relaxed font-medium">"{testi.text}"</p>
                                            <div className="flex items-center gap-4 border-t border-gray-100 dark:border-white/10 pt-6">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-500/20 dark:to-purple-500/20 rounded-full flex items-center justify-center font-black text-blue-600 dark:text-blue-400">
                                                    {testi.name[0]}
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-bold text-slate-900 dark:text-white">{testi.name}</div>
                                                    <div className="text-xs text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">{testi.role}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 4. Final CTA Section */}
                        <div className="mt-40 mb-32 max-w-7xl mx-auto px-6 animate-fade-in">
                            <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-[3rem] p-12 md:p-24 overflow-hidden text-center shadow-2xl group transition-all">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
                                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                                
                                <div className="relative z-10 max-w-4xl mx-auto">
                                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
                                        Start writing clearly and confidently with RewriteGuard
                                    </h2>
                                    <p className="text-xl md:text-2xl text-white/80 mb-12 font-medium">
                                        By enhancing your communication and giving your writing greater impact, we can help you reach your personal and professional goals.
                                    </p>
                                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                                        <button
                                            onClick={() => navigateTo('auth')}
                                            className="px-12 py-5 bg-white text-blue-700 font-black text-xl rounded-2xl hover:bg-gray-100 transition-all shadow-xl hover:scale-105 active:scale-95"
                                        >
                                            Sign up now. It's free!
                                        </button>
                                        <button
                                            onClick={() => navigateTo('pricing')}
                                            className="px-12 py-5 bg-transparent border-2 border-white/30 text-white font-black text-xl rounded-2xl hover:bg-white/10 transition-all active:scale-95 backdrop-blur-sm"
                                        >
                                            View Plans
                                        </button>
                                    </div>
                                    <div className="mt-12 text-white/50 text-sm font-bold uppercase tracking-[0.2em]">
                                        Loved by 50,000+ writers worldwide
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
