import { useState, useEffect } from 'react';

interface CookiePreferences {
    essential: boolean;
    analytics: boolean;
    functional: boolean;
    advertising: boolean;
    social: boolean;
}

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const [showPreferenceCenter, setShowPreferenceCenter] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        essential: true,
        analytics: false,
        functional: true,
        advertising: false,
        social: false,
    });

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setIsVisible(true);
        } else {
            try {
                setPreferences(JSON.parse(consent));
            } catch (e) {
                setIsVisible(true);
            }
        }

        // Listen for internal event to open settings
        const handleOpenSettings = () => {
            setShowPreferenceCenter(true);
            setIsVisible(false); // Hide banner if it was showing
        };

        window.addEventListener('open-cookie-settings', handleOpenSettings);
        return () => window.removeEventListener('open-cookie-settings', handleOpenSettings);
    }, []);

    const handleAcceptAll = () => {
        const allAccepted = {
            essential: true,
            analytics: true,
            functional: true,
            advertising: true,
            social: true,
        };
        setPreferences(allAccepted);
        localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
        setIsVisible(false);
        setShowPreferenceCenter(false);
    };

    const handleDeclineAll = () => {
        const allDeclined = {
            essential: true,
            analytics: false,
            functional: true,
            advertising: false,
            social: false,
        };
        setPreferences(allDeclined);
        localStorage.setItem('cookie-consent', JSON.stringify(allDeclined));
        setIsVisible(false);
        setShowPreferenceCenter(false);
    };

    const handleSavePreferences = () => {
        localStorage.setItem('cookie-consent', JSON.stringify(preferences));
        setIsVisible(false);
        setShowPreferenceCenter(false);
    };

    const togglePreference = (key: keyof CookiePreferences) => {
        if (key === 'essential' || key === 'functional') return;
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!isVisible && !showPreferenceCenter) return null;

    return (
        <>
            {/* Cookie Banner */}
            {isVisible && !showPreferenceCenter && (
                <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 lg:p-4 animate-fade-in-up">
                    <div className="max-w-6xl mx-auto bg-slate-800/95 backdrop-blur-2xl text-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden p-8 md:p-10 border border-white/10">
                        <div className="flex flex-col gap-6">
                            <h2 className="text-2xl md:text-3xl font-extrabold text-white text-left tracking-tight">RewriteGuard uses cookies</h2>
                            <p className="text-gray-300 text-base md:text-[1.1rem] leading-relaxed text-left font-medium">
                                We use cookies and similar technologies. Some are necessary to operate our service and can't be
                                deactivated. Others, like analytics and ad cookies, are optional. We do not link mobile app data
                                with third-party data for ad purposes or share app data with data brokers. If you consent and
                                click "Accept All," we will store and/or access data on a device and process personal data for
                                personalization, marketing, and analytics purposes. You may also click "Customize" to customize
                                your preferences or "Decline All" so that only strictly necessary and functional cookies are used..
                                For more details, including how to change your preferences at any time, see our{' '}
                                <a href="/cookies-policy" className="text-blue-400 hover:text-blue-300 font-bold underline decoration-2 underline-offset-4">
                                    Cookies Policy
                                </a>
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-4">
                                <button
                                    onClick={() => setShowPreferenceCenter(true)}
                                    className="w-full sm:w-auto px-10 py-3.5 border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    Customize
                                </button>
                                <button
                                    onClick={handleDeclineAll}
                                    className="w-full sm:w-auto px-10 py-3.5 border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    Decline All
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg hover:scale-[1.02] shadow-xl shadow-blue-500/20 transition-all cursor-pointer"
                                >
                                    Accept All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Privacy Preference Center Modal */}
            {showPreferenceCenter && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-slate-800 text-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-white/10">
                        {/* Modal Header */}
                        <div className="p-4 px-6 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <span className="text-white font-bold text-xl leading-tight">RewriteGuard</span>
                            </div>
                            <button
                                onClick={() => {
                                    setShowPreferenceCenter(false);
                                    if (!localStorage.getItem('cookie-consent')) setIsVisible(true);
                                }}
                                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            <section>
                                <h3 className="text-2xl font-bold text-white mb-4 text-left">Privacy Preference Center</h3>
                                <p className="text-gray-400 leading-relaxed text-sm text-left">
                                    Our website uses different types of cookies. Optional cookies will only be enabled with your consent and you may withdraw this consent at any time. Below you can learn more about the types of cookies we use and select your cookie preferences. For more information on the cookies we use, see our Cookie Policy. <a href="/cookies-policy" className="text-blue-400 hover:underline font-medium">More information</a>
                                </p>
                                <div className="flex justify-start">
                                    <button
                                        onClick={handleAcceptAll}
                                        className="mt-6 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md font-bold text-sm hover:scale-[1.02] transition-all cursor-pointer"
                                    >
                                        Accept All
                                    </button>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h4 className="text-lg font-bold text-white border-b border-white/5 pb-2 text-left">Manage Consent Preferences</h4>

                                {/* Essential Cookies */}
                                <PreferenceItem
                                    title="Essential Cookies"
                                    description="Essential Cookies are required for providing you with features or services that you have requested. For example, certain Cookies enable you to log into secure areas of our Services."
                                    isActive={true}
                                    isAlwaysActive={true}
                                />

                                {/* Analytics Cookies */}
                                <PreferenceItem
                                    title="Analytics Cookies"
                                    description="Analytics Cookies allow us to understand how visitors use our Services. They do this by collecting information about the number of visitors to the Services, what pages visitors view on our Services and how long visitors are viewing pages on the Services. Analytics Cookies also help us measure the performance of our advertising campaigns in order to help us improve our campaigns and the Services' content for those who engage with our advertising."
                                    isActive={preferences.analytics}
                                    onToggle={() => togglePreference('analytics')}
                                />

                                {/* Functional Cookies */}
                                <PreferenceItem
                                    title="Functional Cookies"
                                    description="Functional Cookies are used to record your choices and settings regarding our Services, maintain your preferences over time and recognize you when you return to our Services. These Cookies help us to personalize our content for you, greet you by name and remember your preferences (for example, your choice of language or region)."
                                    isActive={true}
                                    isAlwaysActive={true}
                                />

                                {/* Advertising Cookies */}
                                <PreferenceItem
                                    title="Advertising Cookies"
                                    description="Advertising Cookies collect data about your online activity and identify your interests so that we can provide advertising that we believe is relevant to you. Advertising Cookies may include Retargeting Cookies."
                                    isActive={preferences.advertising}
                                    onToggle={() => togglePreference('advertising')}
                                />

                                {/* Social Media Cookies */}
                                <PreferenceItem
                                    title="Social Media Cookies"
                                    description="These cookies are set by a range of social media services that we have added to the site to enable you to share our content with your friends and networks. They are capable of tracking your browser across other sites and building up a profile of your interests. This may impact the content and messages you see on other websites you visit. If you do not allow these cookies you may not be able to use or see these sharing tools."
                                    isActive={preferences.social}
                                    onToggle={() => togglePreference('social')}
                                />
                            </section>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-white/5 bg-slate-800 flex flex-col items-center gap-4">
                            <button
                                onClick={handleSavePreferences}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-xl hover:scale-[1.01] transition-all cursor-pointer shadow-lg shadow-blue-500/20"
                            >
                                Save and Close
                            </button>
                            <div className="flex items-center gap-1 opacity-50">
                                <span className="text-xs font-medium text-gray-400">Powered by</span>
                                <a href="https://www.p5solution.com/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-white underline decoration-blue-500 hover:text-blue-400 transition-colors">P5Solution</a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

interface PreferenceItemProps {
    title: string;
    description: string;
    isActive: boolean;
    isAlwaysActive?: boolean;
    onToggle?: () => void;
}

function PreferenceItem({ title, description, isActive, isAlwaysActive, onToggle }: PreferenceItemProps) {
    return (
        <div className="space-y-3 pb-4 border-b border-white/5 last:border-0">
            <div className="flex justify-between items-center text-base">
                <span className="font-bold text-white">{title}</span>
                {isAlwaysActive ? (
                    <span className="text-blue-400 font-bold uppercase tracking-widest text-[11px]">ALWAYS ACTIVE</span>
                ) : (
                    <button
                        onClick={onToggle}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${isActive ? 'bg-blue-600' : 'bg-slate-700'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-4' : 'translate-x-1'
                                }`}
                        />
                    </button>
                )}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed text-left">
                {description}
            </p>
        </div>
    );
}
