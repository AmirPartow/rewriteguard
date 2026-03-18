import { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import LogoHomeButton from './components/LogoHomeButton';

interface ContactSupportProps {
    onBack: () => void;
    mode?: 'help' | 'contact';
}

export default function ContactSupport({ onBack, mode = 'contact' }: ContactSupportProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [overrideMode, setOverrideMode] = useState<'help' | 'contact' | null>(null);

    const currentMode = overrideMode || mode;

    // Listen for switch events
    useEffect(() => {
        const handleSwitch = () => setOverrideMode('contact');
        window.addEventListener('switch-contact-mode', handleSwitch);
        return () => window.removeEventListener('switch-contact-mode', handleSwitch);
    }, []);

    // Help Center States
    const [helpView, setHelpView] = useState<'main' | 'category'>('main');
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const helpData = [
        {
            id: 'about',
            title: 'About RewriteGuard',
            description: 'Find information about RewriteGuard and best practices.',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            sections: [
                {
                    title: 'General Questions',
                    articles: [
                        'Is RewriteGuard considered AI writing?',
                        'What languages does RewriteGuard work in?',
                        'Does RewriteGuard offer an API?',
                        'What was RewriteGuard originally designed for?',
                        'Who uses RewriteGuard?',
                        'How do I use RewriteGuard for free?'
                    ]
                },
                {
                    title: 'Data Privacy & Security',
                    articles: [
                        'About the March 2026 Privacy Policy Update',
                        'Which trusted third parties does RewriteGuard share my personal information with?',
                        'How does RewriteGuard use my data?',
                        'How does RewriteGuard protect and retain my personal data?',
                        'Does RewriteGuard have measures in place to prevent access to my sensitive information?',
                        'Does RewriteGuard sell my content?'
                    ]
                }
            ]
        },
        {
            id: 'guide',
            title: 'Product Guide',
            description: 'Information about all our tools, features, and how to use them.',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            sections: [
                {
                    title: 'AI Detector',
                    articles: [
                        'How to use the RewriteGuard AI Detector',
                        'What are the different detection levels?',
                        'Understanding the confidence score',
                        'How to integrate the detector into your workflow',
                        'Common detection scenarios and best practices'
                    ]
                },
                {
                    title: 'Paraphrasing Tool',
                    articles: [
                        'Getting started with the Paraphraser',
                        'Different paraphrasing modes explained',
                        'Using the synonym slider effectively',
                        'How to maintain specific tone and style'
                    ]
                }
            ]
        },
        {
            id: 'billing',
            title: 'Account & Billing',
            description: 'Manage your account, premium subscription, and payments.',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
            sections: [
                {
                    title: 'User Account',
                    articles: [
                        'How do I sign up or log in?',
                        'Resetting your password',
                        'Updating your profile information',
                        'Managing email notifications',
                        'How to delete your account'
                    ]
                },
                {
                    title: 'Premium & Pricing',
                    articles: [
                        'Premium subscription plans',
                        'How to upgrade to Premium',
                        'Payment methods we accept',
                        'Managing your subscription billing',
                        'Cancellation and refund policy'
                    ]
                }
            ]
        },
        {
            id: 'trouble',
            title: 'Basic Troubleshooting',
            description: 'Common issues and how to resolve them quickly.',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            sections: [
                {
                    title: 'Common Fixes',
                    articles: [
                        'Clearing browser cache and cookies',
                        'Browser extensions conflicts',
                        'Page loading issues',
                        'Logout Troubleshooting'
                    ]
                }
            ]
        }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('category', category);
            formData.append('sub_category', subCategory);
            formData.append('subject', subject);
            formData.append('description', description);
            if (selectedFile) {
                formData.append('attachment', selectedFile);
            }

            const response = await fetch(`${API_BASE_URL}/v1/support/submit`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to submit request');
            setSubmitted(true);
        } catch (err) {
            setError('Something went wrong. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto p-12 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2.5rem] text-center animate-fade-in shadow-xl transition-colors">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 transition-colors">
                    <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-3xl font-black mb-4 text-slate-900 dark:text-white transition-colors tracking-tight">Request Received!</h2>
                <p className="text-slate-500 dark:text-gray-400 mb-8 leading-relaxed font-bold transition-colors">
                    Thank you for contacting RewriteGuard support. We've received your request and our team will get back to you at <strong>{email}</strong> as soon as possible.
                </p>
                <div className="flex justify-center mt-8">
                    <LogoHomeButton onClick={onBack} />
                </div>
            </div>
        );
    }

    // Help Center View
    if (currentMode === 'help') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
                {/* Help Center Header */}
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 px-6 md:px-12 flex items-center justify-between sticky top-0 z-[100] transition-colors">
                    <LogoHomeButton onClick={onBack} />
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => setOverrideMode('contact')}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
                        >
                            Contact us
                        </button>
                    </div>
                </header>

                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 pt-20 pb-20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                        <svg className="w-full h-full text-white" viewBox="0 0 200 200" fill="currentColor">
                            <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-46.2C87.4,-33.3,90.1,-17.6,88.7,-2.4C87.3,12.8,81.8,27.5,73.1,40.1C64.4,52.7,52.5,63.2,39.1,70.1C25.7,77,10.8,80.3,-3.8,86.9C-18.4,93.5,-32.7,103.4,-44.6,100.9C-56.5,98.4,-65.9,83.4,-72.4,69.5C-78.9,55.6,-82.5,42.8,-83.9,30.1C-85.3,17.4,-84.6,4.8,-81.4,-7.1C-78.2,-19,-72.5,-30.2,-64.3,-39.8C-56.1,-49.4,-45.4,-57.4,-34.2,-65.8C-23,-74.2,-11.5,-83,2.4,-87.1C16.3,-91.2,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
                        </svg>
                    </div>
                    
                    <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">How can we help?</h1>
                        <div className="max-w-2xl mx-auto relative group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <svg className="w-6 h-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search our help center..."
                                className="w-full bg-white border-0 rounded-2xl py-5 pl-14 pr-6 text-slate-900 text-lg font-bold shadow-2xl focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-6 py-12">
                    {helpView === 'main' ? (
                        <div className="animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {helpData.map((cat) => (
                                    <div 
                                        key={cat.id}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setHelpView('category');
                                            window.scrollTo(0, 0);
                                        }}
                                        className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group text-center flex flex-col items-center"
                                    >
                                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                            {cat.icon}
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{cat.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-6 leading-relaxed">
                                            {cat.description}
                                        </p>
                                        <span className="text-blue-600 dark:text-blue-400 text-sm font-black group-hover:underline flex items-center gap-2">
                                            Learn more
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-20 text-center">
                                <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-10 rounded-[2.5rem] inline-block max-w-xl shadow-xl">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Still need help?</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 italic">"Our team is always here to help you get the most out of RewriteGuard."</p>
                                    <button 
                                        onClick={() => setOverrideMode('contact')}
                                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl"
                                    >
                                        Contact Us
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in-up">
                            {/* Breadcrumbs */}
                            <div className="flex items-center gap-3 text-sm font-bold text-slate-400 mb-8 border-b border-gray-200 dark:border-slate-800 pb-4">
                                <button onClick={() => setHelpView('main')} className="hover:text-blue-600 transition-colors">Help Center</button>
                                <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                <span className="text-slate-900 dark:text-white capitalize">{selectedCategory.title}</span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
                                {selectedCategory.sections.map((section: any, sIdx: number) => (
                                    <div key={sIdx} className="space-y-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{section.title}</h2>
                                        </div>
                                        <ul className="space-y-1">
                                            {section.articles.map((article: string, aIdx: number) => (
                                                <li key={aIdx}>
                                                    <button className="w-full text-left py-3 px-4 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-md text-blue-600 dark:text-blue-400 font-bold transition-all border border-transparent hover:border-blue-100 dark:hover:border-slate-700 flex items-center justify-between group">
                                                        <span>{article}</span>
                                                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                                    </button>
                                                </li>
                                            ))}
                                            <li>
                                                <button className="text-slate-400 hover:text-blue-600 text-sm font-black py-2 px-4 transition-colors">See all articles</button>
                                            </li>
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-20 border-t border-gray-200 dark:border-slate-800 pt-12 flex items-center justify-between">
                                <button 
                                    onClick={() => setHelpView('main')}
                                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-black"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                                    Back to Categories
                                </button>
                                <button 
                                    onClick={() => setOverrideMode('contact')}
                                    className="text-blue-600 font-black hover:underline"
                                >
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 animate-fade-in-up">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 mb-4 transition-colors">
                        <span className="cursor-pointer hover:text-blue-600" onClick={() => { setOverrideMode(null); setHelpView('main'); onBack(); }}>RewriteGuard</span>
                        <span>›</span>
                        {overrideMode === 'contact' && (
                            <>
                                <span className="cursor-pointer hover:text-blue-600" onClick={() => setOverrideMode(null)}>Help Center</span>
                                <span>›</span>
                            </>
                        )}
                        <span className="text-blue-600 dark:text-gray-300">Submit a request</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">
                        Contact support
                    </h1>
                    {overrideMode === 'contact' && (
                        <button 
                            onClick={() => setOverrideMode(null)}
                            className="mt-4 flex items-center gap-2 text-sm font-black text-slate-500 hover:text-blue-600 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            Back to Help Center
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-10 rounded-[2.5rem] shadow-xl transition-colors">
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 dark:text-gray-400 ml-1 uppercase tracking-widest transition-colors">Select a category to help us find the right solution for you.</label>
                        <select
                            required
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                if (e.target.value !== 'Technical issue') setSubCategory('');
                            }}
                            className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer font-bold appearance-none transition-colors"
                        >
                            <option value="">-</option>
                            <option value="Technical issue">Technical issue</option>
                            <option value="Membership/Account">Unable to access Premium</option>
                            <option value="Manage account">Manage account</option>
                            <option value="Login errors">Login errors</option>
                            <option value="Payment issue">Payment issue</option>
                            <option value="Cancellation">Cancellation and refund</option>
                            <option value="General feedback">General questions, feedback, and other requests</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 dark:text-gray-400 ml-1 uppercase tracking-widest transition-colors">Full Name</label>
                            <input
                                required
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold transition-colors"
                                placeholder="Jane Doe"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 dark:text-gray-400 ml-1 uppercase tracking-widest transition-colors">Email Address</label>
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold transition-colors"
                                placeholder="jane@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 dark:text-gray-400 ml-1 uppercase tracking-widest transition-colors">Subject <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black transition-colors"
                        />
                    </div>

                    {category === 'Technical issue' && (
                        <div className="space-y-2 animate-fade-in-down">
                            <label className="text-sm font-semibold text-gray-400 ml-1">I want to report an issue for: <span className="text-red-500">*</span></label>
                            <select
                                required
                                value={subCategory}
                                onChange={(e) => setSubCategory(e.target.value)}
                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none transition-all cursor-pointer"
                            >
                                <option value="">-</option>
                                <option value="Paraphraser">Paraphraser</option>
                                <option value="Grammar Checker">Grammar Checker</option>
                                <option value="Plagiarism Checker">Plagiarism Checker</option>
                                <option value="RewriteGuard Flow">RewriteGuard Flow</option>
                                <option value="Citation Generator">Citation Generator</option>
                                <option value="AI Detector">AI Detector</option>
                            </select>
                            <p className="text-xs text-gray-500 ml-1">Select the product you are facing an issue with.</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 dark:text-gray-400 ml-1 uppercase tracking-widest transition-colors">Description / Message <span className="text-red-500">*</span></label>
                        <textarea
                            required
                            rows={8}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold resize-none transition-colors"
                            placeholder="Please explain your request in detail..."
                        />
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold px-1 transition-colors">Please enter the details of your request. A member of our support staff will respond as soon as possible.</p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 dark:text-gray-400 ml-1 uppercase tracking-widest transition-colors">Attachments (Optional)</label>
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setSelectedFile(file);
                            }}
                        />
                        <div
                            onClick={() => !selectedFile && document.getElementById('file-upload')?.click()}
                            className={`w-full border-2 border-dashed rounded-3xl p-6 flex items-center justify-center transition-all ${selectedFile
                                ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10'
                                : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/5 hover:border-blue-500/50 cursor-pointer group'
                                }`}
                        >
                            <div className="text-sm text-slate-400 dark:text-gray-400 flex items-center gap-3 transition-colors">
                                {selectedFile ? (
                                    <>
                                        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-slate-900 dark:text-white font-black">{selectedFile.name}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFile(null);
                                            }}
                                            className="text-red-500 hover:text-red-600 font-black ml-4 underline underline-offset-4"
                                        >
                                            Remove
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <svg className="w-8 h-8 text-slate-400 dark:text-gray-500 mb-1 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span className="text-[13px] font-black text-slate-500 dark:text-gray-400"><span className="text-blue-600 dark:text-blue-400 uppercase tracking-widest mr-1">Add file</span> or drop here</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm animate-shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${isSubmitting
                            ? 'bg-gray-100 dark:bg-white/5 text-slate-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-white/10'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-[1.02] shadow-blue-500/20 active:scale-[0.98]'
                            }`}
                    >
                        {isSubmitting ? (
                            <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <>
                                Submit Request
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Sidebar Cards */}
            <div className="space-y-8">
                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-8 rounded-[2.5rem] hover:shadow-xl transition-all cursor-pointer group shadow-sm transition-colors">
                    <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white transition-colors">Chat to support</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400 font-bold leading-relaxed transition-colors">Need a hand? Chat with our support team for quick assistance.</p>
                </div>

                <a href="https://discord.gg/qfDKsNTp" target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-8 rounded-[2.5rem] hover:shadow-xl transition-all cursor-pointer group shadow-sm transition-colors">
                    <div className="w-12 h-12 bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white transition-colors">Join Discord</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400 font-bold leading-relaxed transition-colors">Join our Discord community for updates, discussions, and more.</p>
                </a>

                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-sm hover:shadow-xl transition-all transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl rounded-full"></div>
                    <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-black mb-2 text-slate-900 dark:text-white transition-colors">RewriteGuard Office</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-black mb-1 transition-colors uppercase tracking-widest">Vancouver</p>
                    <p className="text-sm text-slate-500 dark:text-gray-400 font-bold leading-relaxed transition-colors">143 21st stree East north vancouver</p>
                    <p className="text-sm text-slate-500 dark:text-gray-400 font-bold transition-colors">Canada, BC, V7L 3B5</p>
                </div>
            </div>
        </div>
    );
}
