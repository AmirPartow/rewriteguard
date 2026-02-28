import Footer from './components/Footer';

export default function LegalCenter(props: any) {
    const { onPrivacyClick, onTermsClick, onShowPolicy: onCookiesClick } = props;
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

    const handleCookiesClick = (e: React.MouseEvent) => {
        if (onCookiesClick) {
            e.preventDefault();
            onCookiesClick();
        }
    };

    return (
        <div className="min-h-screen flex flex-col text-white bg-[#0f172a]">
            {/* Header Area */}
            <div className="bg-gradient-to-b from-blue-900/20 to-[#0f172a] pt-20 pb-16 px-6 text-center border-b border-white/5">
                <div className="max-w-4xl mx-auto animate-fade-in-up">
                    <a
                        href="/"
                        className="inline-flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors mb-10 group"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </a>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Legal Center
                    </h1>
                    <p className="text-lg text-gray-400">
                        All the legal resources you need in one place for your convenience.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow p-6 md:p-12 mb-20">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

                    {/* General Terms Column */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.08] transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-2xl rounded-full group-hover:bg-blue-500/10 transition-colors"></div>
                        <h2 className="text-xl font-bold text-white mb-2">General terms</h2>
                        <p className="text-sm text-gray-400 mb-8 pb-8 border-b border-white/10">
                            These terms and policies apply to all users of RewriteGuard Services.
                        </p>

                        <ul className="space-y-4 text-sm font-semibold">
                            <li>
                                <a href="/terms-of-service" onClick={handleTermsClick} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group/link">
                                    <svg className="w-4 h-4 text-gray-500 group-hover/link:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    RewriteGuard terms of service
                                </a>
                            </li>
                            <li>
                                <a href="/privacy-policy" onClick={handlePrivacyClick} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group/link">
                                    <svg className="w-4 h-4 text-gray-500 group-hover/link:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    Privacy policy
                                </a>
                            </li>
                            <li>
                                <a href="/cookies-policy" onClick={handleCookiesClick} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group/link">
                                    <svg className="w-4 h-4 text-gray-500 group-hover/link:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    Cookies policy
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Content and Copyright Column */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.08] transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-2xl rounded-full group-hover:bg-purple-500/10 transition-colors"></div>

                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">Content and copyright</h2>
                            <p className="text-sm text-gray-400 mb-8 pb-8 border-b border-white/10">
                                These policies and pages apply to RewriteGuard Services that process or host user-generated content.
                            </p>

                            <ul className="space-y-4 text-sm font-semibold">
                                <li>
                                    <a href="#" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group/link opacity-70 cursor-not-allowed" title="Coming soon">
                                        <svg className="w-4 h-4 text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        Community guidelines
                                    </a>
                                </li>
                                <li>
                                    <a href="/terms-of-service" onClick={handleTermsClick} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group/link">
                                        <svg className="w-4 h-4 text-gray-500 group-hover/link:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        Copyright policy
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>

            <Footer {...props} />
        </div>
    );
}
