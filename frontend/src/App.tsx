import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import AccountMenu from './components/AccountMenu';
import Dashboard from './Dashboard';
import Detector from './Detector';
import Paraphraser from './Paraphraser';
import AdminPage from './AdminPage';
import LandingPage from './LandingPage';
import CookieConsent from './components/CookieConsent';
import CookiesPolicy from './CookiesPolicy';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import LegalCenter from './LegalCenter';
import Footer from './components/Footer';
import ContactSupport from './ContactSupport';

type ActivePage = 'dashboard' | 'detector' | 'paraphraser' | 'admin' | 'contact' | 'help';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [isGuest, setIsGuest] = useState(false);
  const [paraphraserText, setParaphraserText] = useState('');
  const [showCookiesPolicy, setShowCookiesPolicy] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showLegalCenter, setShowLegalCenter] = useState(false);
  const [showPublicHome, setShowPublicHome] = useState(false);

  // Listen for hash change or custom events to show policy
  useEffect(() => {
    const handlePopState = () => {
      setShowCookiesPolicy(window.location.pathname === '/cookies-policy');
      setShowPrivacyPolicy(window.location.pathname === '/privacy-policy');
      setShowTermsOfService(window.location.pathname === '/terms-of-service');
      setShowLegalCenter(window.location.pathname === '/legal-center');
      setShowPublicHome(window.location.pathname === '/' && window.history.state?.publicHome === true);
    };

    const handleGuestAuth = () => {
      setIsGuest(false);
      setTimeout(() => window.dispatchEvent(new Event('open-auth')), 50);
    };

    const handleGoPublicHome = () => {
      setShowCookiesPolicy(false);
      setShowPrivacyPolicy(false);
      setShowTermsOfService(false);
      setShowLegalCenter(false);
      setShowPublicHome(true);
      window.history.pushState({ publicHome: true }, '', '/');
      window.scrollTo(0, 0);
    };

    const handleParaphraserText = (e: Event) => {
      const text = (e as CustomEvent).detail;
      if (text) setParaphraserText(text);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('open-auth-from-guest', handleGuestAuth);
    window.addEventListener('send-to-paraphraser', handleParaphraserText);
    window.addEventListener('go-public-home', handleGoPublicHome);
    handlePopState();
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('open-auth-from-guest', handleGuestAuth);
      window.removeEventListener('send-to-paraphraser', handleParaphraserText);
      window.removeEventListener('go-public-home', handleGoPublicHome);
    };
  }, []);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }



  const handlePolicyNav = (path: string, setter: (val: boolean) => void) => {
    setShowCookiesPolicy(false);
    setShowPrivacyPolicy(false);
    setShowTermsOfService(false);
    setShowLegalCenter(false);
    setShowPublicHome(false);
    window.history.pushState({}, '', path);
    setter(true);
    window.scrollTo(0, 0);
  };

  const footerProps = {
    onShowPolicy: () => handlePolicyNav('/cookies-policy', setShowCookiesPolicy),
    onPrivacyClick: () => handlePolicyNav('/privacy-policy', setShowPrivacyPolicy),
    onTermsClick: () => handlePolicyNav('/terms-of-service', setShowTermsOfService),
    onLegalClick: () => handlePolicyNav('/legal-center', setShowLegalCenter),
    onHelpClick: () => {
      setShowCookiesPolicy(false);
      setShowPrivacyPolicy(false);
      setShowTermsOfService(false);
      setShowLegalCenter(false);
      setShowPublicHome(false);
      window.history.pushState({}, '', '/');
      window.scrollTo(0, 0);
      setTimeout(() => {
        setActivePage('help');
      }, 50);
    },
    onContactClick: () => {
      setShowCookiesPolicy(false);
      setShowPrivacyPolicy(false);
      setShowTermsOfService(false);
      setShowLegalCenter(false);
      setShowPublicHome(false);
      window.history.pushState({}, '', '/');
      window.scrollTo(0, 0);
      setTimeout(() => {
        if (isAuthenticated) {
          setActivePage('contact');
        } else {
          window.dispatchEvent(new Event('open-contact'));
        }
      }, 50);
    }
  };

  // Handle Cookies Policy View
  if (showCookiesPolicy) {
    return (<><CookiesPolicy {...footerProps} /><CookieConsent /></>);
  }

  // Handle Privacy Policy View
  if (showPrivacyPolicy) {
    return (<><PrivacyPolicy {...footerProps} /><CookieConsent /></>);
  }

  // Handle Terms of Service View
  if (showTermsOfService) {
    return (<><TermsOfService {...footerProps} /><CookieConsent /></>);
  }

  // Handle Legal Center View
  if (showLegalCenter) {
    return (<><LegalCenter {...footerProps} /><CookieConsent /></>);
  }

  // Show Landing Page if not authenticated AND not in guest mode, or if public home is forced
  if (showPublicHome || (!isAuthenticated && !isGuest)) {
    return (
      <>
        <LandingPage
          onGuestEntry={() => { setIsGuest(true); setShowPublicHome(false); setActivePage('detector'); }}
          onDashboardEntry={() => { setShowPublicHome(false); setActivePage('dashboard'); }}
          isAuthenticated={!!isAuthenticated}
          {...footerProps}
        />
        <CookieConsent />
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-gray-200 font-sans transition-colors duration-300">

      {/* Sidebar */}
      <aside className="w-16 flex-shrink-0 bg-white dark:bg-[#0f172a] border-r border-gray-200 dark:border-white/10 flex flex-col items-center py-4 gap-6 z-20 transition-colors">
        <button onClick={() => window.dispatchEvent(new Event('go-public-home'))} className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform cursor-pointer">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </button>

        <nav className="flex flex-col gap-5">
          <button onClick={() => setActivePage('dashboard')} className={`p-2 rounded-lg transition-colors ${activePage === 'dashboard' ? 'bg-blue-50 dark:bg-white/10 text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
          </button>
          <button onClick={() => setActivePage('detector')} className={`p-2 rounded-lg transition-colors ${activePage === 'detector' ? 'bg-blue-50 dark:bg-white/10 text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </button>
          <button onClick={() => setActivePage('paraphraser')} className={`p-2 rounded-lg transition-colors ${activePage === 'paraphraser' ? 'bg-blue-50 dark:bg-white/10 text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <button className="p-2 rounded-lg text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-gray-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg></button>
          <button className="p-2 rounded-lg text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-gray-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
        </nav>
      </aside>

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Top Navbar */}
        <header className="h-14 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 px-8 flex items-center justify-between z-10 sticky top-0 transition-colors">
          <div className="flex items-center gap-4">
            <span onClick={() => window.dispatchEvent(new Event('go-public-home'))} className="font-bold text-xl cursor-pointer tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent hover:opacity-80 transition-all">RewriteGuard</span>
            <span className="text-gray-300 dark:text-gray-600 mx-1">/</span>
            <span className="text-slate-500 dark:text-gray-400 font-medium text-sm tracking-tight">{activePage === 'detector' ? 'AI Detector' : activePage === 'paraphraser' ? 'Paraphrasing Tool' : activePage.charAt(0).toUpperCase() + activePage.slice(1)}</span>
          </div>

          <div className="flex items-center gap-4">
            <AccountMenu 
              onLoginClick={() => window.dispatchEvent(new Event('open-auth-from-guest'))}
              onContactClick={() => setActivePage('contact')}
              onHelpClick={() => setActivePage('help')}
            />
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-x-hidden transition-all duration-300">
          <div className="w-full flex-1 flex flex-col">
            {activePage === 'dashboard' && <Dashboard />}
            {activePage === 'detector' && <Detector />}
            {activePage === 'paraphraser' && <Paraphraser initialText={paraphraserText} onTextConsumed={() => setParaphraserText('')} />}
            {activePage === 'admin' && <AdminPage />}
            {activePage === 'contact' && <ContactSupport onBack={() => setActivePage('dashboard')} mode="contact" />}
            {activePage === 'help' && <ContactSupport onBack={() => setActivePage('dashboard')} mode="help" />}
          </div>

          {/* Paraphraser Promo Bar — slim, only on detector */}
          {activePage === 'detector' && (
            <div className="w-full max-w-full h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg px-6 flex items-center justify-between animate-fade-in transition-all shrink-0 mt-2">
              <span className="text-blue-300 font-bold text-xs tracking-tight">Want your text to sound more authentic?</span>
              <button
                onClick={() => {
                  window.dispatchEvent(new Event('grab-detector-text'));
                  setTimeout(() => setActivePage('paraphraser'), 50);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black tracking-[0.05em] hover:scale-105 transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
              >
                Refine with Paraphraser
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          )}

          {/* Footer — show on all pages */}
          <Footer
            {...footerProps}
            className="w-full mt-12 shrink-0"
          />
        </main>
      </div>

      <CookieConsent />
    </div>
  );
}

export default App;
