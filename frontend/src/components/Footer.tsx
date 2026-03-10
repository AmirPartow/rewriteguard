import React from 'react';

interface FooterProps {
    onShowPolicy?: () => void;
    onPrivacyClick?: () => void;
    onTermsClick?: () => void;
    onLegalClick?: () => void;
    onContactClick?: () => void;
    className?: string;
}

export default function Footer({ onShowPolicy, onPrivacyClick, onTermsClick, onLegalClick, onContactClick, className = "" }: FooterProps) {
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

        {
            name: 'LinkedIn',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                </svg>
            ),
            url: '#',
            color: 'text-[#0A66C2]'
        },
        {
            name: 'X',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.494h2.039L6.486 3.24H4.298l13.311 17.407z" />
                </svg>
            ),
            url: '#',
            color: 'text-white'
        },
    ];

    return (
        <footer className={`w-full mt-auto ${className}`}>
            {/* Main Content Area - Dark theme to match website */}
            <div className="bg-[#0f172a] py-16 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    {/* Top Row: Navigation Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                        {/* Column 2: Premium */}
                        <div className="space-y-4">
                            <h4 className="text-[15px] font-bold text-white border-b border-white/10 pb-2">Premium</h4>
                            <ul className="space-y-2 text-[13px] text-gray-400 font-medium">
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Plan Details</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">For Teams</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Affiliates</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Request a Demo</a></li>
                            </ul>
                        </div>

                        {/* Column 3: Tools */}
                        <div className="space-y-4">
                            <h4 className="text-[15px] font-bold text-white border-b border-white/10 pb-2">Tools</h4>
                            <ul className="space-y-2 text-[13px] text-gray-400 font-medium">
                                <li><a href="/" className="hover:text-blue-400 transition-colors">AI Content Detector</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">AI Paraphraser</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Content Humanizer</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Citing & Originality</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Plagiarism Checker</a></li>
                            </ul>
                        </div>

                        {/* Column 4: Company */}
                        <div className="space-y-4">
                            <h4 className="text-[15px] font-bold text-white border-b border-white/10 pb-2">Company</h4>
                            <ul className="space-y-2 text-[13px] text-gray-400 font-medium">
                                <li><a href="/" className="hover:text-blue-400 transition-colors">About Us</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Trust Center</a></li>
                                <li><a href="/" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                                <li><a href="mailto:support@rewriteguard.com" onClick={handleContactClick} className="hover:text-blue-400 transition-colors cursor-pointer">Contact Us</a></li>
                            </ul>
                        </div>

                        {/* Column 5: Social */}
                        <div className="space-y-4">
                            <h4 className="text-[15px] font-bold text-white border-b border-white/10 pb-2">Follow us on social</h4>
                            <div className="flex flex-wrap gap-4 text-xl">
                                {socialLinks.map((s, i) => (
                                    <a
                                        key={i}
                                        href={s.url}
                                        title={s.name}
                                        className={`hover:scale-110 transition-transform flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 shadow-sm hover:bg-white/10 ${s.color}`}
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
                            className="group flex flex-row items-center justify-center gap-3 px-8 py-3 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 shadow-lg shadow-black/20"
                        >
                            <span className="text-gray-300 font-medium text-[15px] group-hover:text-white transition-colors">
                                Review us on
                            </span>

                            {/* Trustpilot Logo Native SVG */}
                            <div className="flex items-center gap-1.5 text-white font-bold tracking-tight">
                                <svg className="w-6 h-6 text-[#00b67a] drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                                <span className="text-xl">Trustpilot</span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            {/* Sub-Footer - Branding & Legal (Matched to website background as requested earlier) */}
            <div className="bg-[#0f172a] py-12 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
                    {/* Left Side: Branding & Policy Links */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 flex-wrap">
                            <a href="https://www.p5solution.com/" target="_blank" rel="noopener noreferrer" className="text-2xl font-black text-white tracking-tighter uppercase mr-2 hover:text-gray-300 transition-colors">P5 SOLUTION</a>
                            <span className="text-gray-400 text-[13px] font-medium border-l border-white/10 pl-4 italic">RewriteGuard, a <a href="https://www.p5solution.com/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-200 transition-colors">P5Solution</a> business</span>
                        </div>

                        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] font-semibold text-blue-400/90">
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

                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-x-3 text-[12px] text-gray-500 font-medium">
                                <span>Copyright © {new Date().getFullYear()} RewriteGuard</span>
                                <span className="text-gray-600">,</span>
                                <a href="/legal-center" onClick={handleLegalClick} className="hover:text-gray-300 transition-colors cursor-pointer">Community Guidelines, DSA and other Legal Resources</a>
                            </div>
                            <p className="text-[11px] text-gray-600 leading-relaxed max-w-2xl">
                                This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" target="_blank" className="underline">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" className="underline">Terms of Service</a> apply.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Quality Seal */}
                    <div className="text-gray-400 text-[13px] font-semibold flex items-center gap-2 self-end tracking-tight bg-white/5 px-4 py-2 rounded-full border border-white/5">
                        <span>Made with</span>
                        <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <span>at</span>
                        <a href="https://www.rewriteguard.com" className="hover:text-white transition-colors border-b border-gray-600 pb-0.5">RewriteGuard</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
