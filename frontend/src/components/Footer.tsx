import React from 'react';

interface FooterProps {
    onShowPolicy?: () => void;
    onPrivacyClick?: () => void;
    onTermsClick?: () => void;
    onLegalClick?: () => void;
    onContactClick?: () => void;
    onHelpClick?: () => void;
    className?: string;
}

export default function Footer({ onShowPolicy, onPrivacyClick, onTermsClick, onLegalClick, onContactClick, onHelpClick, className = "" }: FooterProps) {
    const handlePolicyClick = (e: React.MouseEvent) => {
        if (onShowPolicy) {
            e.preventDefault();
            onShowPolicy();
        }
    };

    const handlePrivacyClick = (e: React.MouseEvent) => {
        if (onPrivacyClick) {
            e.preventDefault();
            onPrivacyClick();
        }
    };

    const handleTermsClick = (e: React.MouseEvent) => {
        if (onTermsClick) {
            e.preventDefault();
            onTermsClick();
        }
    };

    const handleLegalClick = (e: React.MouseEvent) => {
        if (onLegalClick) {
            e.preventDefault();
            onLegalClick();
        }
    };

    const handleContactClick = (e: React.MouseEvent) => {
        if (onContactClick) {
            e.preventDefault();
            onContactClick();
        }
    };

    const handleHelpClick = (e: React.MouseEvent) => {
        if (onHelpClick) {
            e.preventDefault();
            onHelpClick();
        }
    };

    // Social Media Links (Mock data)
    const socialLinks = [
        {
            name: 'Instagram',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c.796 0 1.441.645 1.441 1.44s-.645 1.44-1.441 1.44c-.795 0-1.439-.645-1.439-1.44s.644-1.44 1.439-1.44z" />
                </svg>
            ),
            url: 'https://instagram.com/rewriteguard',
            color: 'text-[#E4405F]'
        },
        {
            name: 'YouTube',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            ),
            url: 'https://youtube.com/@rewriteguard',
            color: 'text-[#FF0000]'
        },

    ];

    return (
        <footer className={`w-full mt-auto ${className}`}>
            {/* Main Content Area */}
            <div className="bg-slate-50 dark:bg-[#0f172a] py-16 px-6 border-t border-gray-200 dark:border-white/5">
                <div className="w-full">
                    {/* Top Row: Navigation Columns - Centered */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16 text-center">
                        {/* Column 2: Premium */}
                        <div className="space-y-4">
                            <h4 className="text-[15px] font-bold text-slate-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2">Premium</h4>
                            <ul className="space-y-2 text-[13px] text-gray-600 dark:text-gray-400 font-medium">
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Plan Details</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">For Teams</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Affiliates</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Request a Demo</a></li>
                            </ul>
                        </div>

                        {/* Column 3: Tools */}
                        <div className="space-y-4">
                            <h4 className="text-[15px] font-bold text-slate-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2">Tools</h4>
                            <ul className="space-y-2 text-[13px] text-gray-600 dark:text-gray-400 font-medium">
                                <li><a href="/" className="hover:text-blue-400 transition-colors">AI Content Detector</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">AI Paraphraser</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Content Humanizer</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Citing & Originality</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Plagiarism Checker</a></li>
                            </ul>
                        </div>

                        {/* Column 4: Company */}
                        <div className="space-y-4">
                            <h4 className="text-[15px] font-bold text-slate-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2">Company</h4>
                            <ul className="space-y-2 text-[13px] text-gray-600 dark:text-gray-400 font-medium">
                                <li><a href="/" className="hover:text-blue-400 transition-colors">About Us</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Trust Center</a></li>
                                <li><a href="/" onClick={handleHelpClick} className="hover:text-blue-400 transition-colors cursor-pointer">Help Center</a></li>
                                <li><a href="mailto:support@rewriteguard.com" onClick={handleContactClick} className="hover:text-blue-400 transition-colors cursor-pointer">Contact Us</a></li>
                            </ul>
                        </div>

                        {/* Column 5: Social */}
                        <div className="space-y-4">
                            <h4 className="text-[15px] font-bold text-slate-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2">Follow us on social</h4>
                            <div className="flex flex-wrap gap-4 text-xl justify-center">
                                {socialLinks.map((s, i) => (
                                    <a
                                        key={i}
                                        href={s.url}
                                        title={s.name}
                                        className={`hover:scale-110 transition-transform flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm hover:bg-gray-200 dark:hover:bg-white/10 ${s.color}`}
                                    >
                                        {s.icon}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Custom Trustpilot Review Button - Matches Dark Theme */}
                    <div className="flex justify-center border-t border-white/5 pt-12 pb-4">
                        <a
                            href="https://www.trustpilot.com/review/rewriteguard.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-row items-center justify-center gap-3 px-8 py-3 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 shadow-lg"
                        >
                            <span className="text-slate-600 dark:text-gray-300 font-medium text-[15px] group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                Review us on
                            </span>

                            {/* Trustpilot Logo Native SVG */}
                            <div className="flex items-center gap-1.5 text-slate-800 dark:text-white font-bold tracking-tight">
                                <svg className="w-6 h-6 text-[#00b67a] drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                                <span className="text-xl">Trustpilot</span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            {/* Sub-Footer */}
            <div className="bg-slate-100 dark:bg-[#0f172a] py-12 px-6 border-t border-gray-200 dark:border-white/5">
                <div className="w-full flex flex-col items-center text-center gap-12">
                    {/* Branding & Policy Links - Centered */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            <a href="https://www.p5solution.com/" target="_blank" rel="noopener noreferrer" className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase hover:text-slate-600 dark:hover:text-gray-300 transition-colors">P5 SOLUTION</a>
                            <span className="text-gray-500 dark:text-gray-400 text-[13px] font-medium italic">RewriteGuard, a <a href="https://www.p5solution.com/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 dark:hover:text-gray-200 transition-colors">P5Solution</a> business</span>
                        </div>

                        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[14px] font-semibold text-blue-400/90">
                            <a href="/privacy-policy" onClick={handlePrivacyClick} className="hover:text-blue-300 transition-colors">Privacy Policy</a>
                            <span className="text-gray-600 text-[10px]">•</span>
                            <a href="/terms-of-service" onClick={handleTermsClick} className="hover:text-blue-300 transition-colors">Terms of Service</a>
                            <span className="text-gray-600 text-[10px]">•</span>
                            <a href="/cookies-policy" onClick={handlePolicyClick} className="hover:text-blue-300 transition-colors">Cookies Policy</a>
                            <span className="text-gray-600 text-[10px]">•</span>
                            <button
                                onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))}
                                className="hover:text-blue-300 transition-colors cursor-pointer"
                            >
                                Cookie Preferences
                            </button>
                        </nav>

                        <div className="flex flex-col items-center space-y-2">
                            <div className="flex flex-wrap justify-center gap-x-3 text-[12px] text-gray-500 font-medium">
                                <span>Copyright © {new Date().getFullYear()} RewriteGuard</span>
                                <span className="text-gray-600">,</span>
                                <a href="/legal-center" onClick={handleLegalClick} className="hover:text-gray-300 transition-colors cursor-pointer">Community Guidelines, DSA and other Legal Resources</a>
                            </div>
                            <p className="text-[11px] text-gray-600 leading-relaxed max-w-2xl mx-auto">
                                This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" target="_blank" className="underline">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" className="underline">Terms of Service</a> apply.
                            </p>
                        </div>
                    </div>

                    {/* Quality Seal - Centered */}
                    <div className="text-gray-400 text-[13px] font-semibold flex items-center justify-center gap-2 tracking-tight bg-white/5 px-4 py-2 rounded-full border border-white/5">
                        <span>Made with</span>
                        <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <span>at</span>
                        <a href="https://www.rewriteguard.com" className="hover:text-white transition-colors border-b border-gray-600 pb-0.5">RewriteGuard</a>
                    </div>

                    {/* Back Button (last picture) - Added specifically here */}
                    <div className="mt-4 flex justify-center">
                        <button 
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all shadow-md group"
                        >
                            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="font-bold text-sm text-[15px]">Go Back</span>
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
