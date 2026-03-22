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
import PricingView from './components/PricingView';

type ActivePage = 'dashboard' | 'detector' | 'paraphraser' | 'admin' | 'contact' | 'help' | 'pricing';

function App() {
  const { isAuthenticated, isLoading, socialConfirm } = useAuth();
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');

  const navigateTo = (page: ActivePage) => {
    if (page === activePage) return;
    window.history.pushState({ activePage: page }, '', window.location.pathname);
    setActivePage(page);
    window.scrollTo(0, 0);
  };
  const [isGuest, setIsGuest] = useState(false);
  const [paraphraserText, setParaphraserText] = useState('');
  const [showCookiesPolicy, setShowCookiesPolicy] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showLegalCenter, setShowLegalCenter] = useState(false);
  const [showPublicHome, setShowPublicHome] = useState(false);

    // 1. Auth & Policy Lifecycle
    useEffect(() => {
        const handlePopState = (e?: PopStateEvent) => {
            setShowCookiesPolicy(window.location.pathname === '/cookies-policy');
            setShowPrivacyPolicy(window.location.pathname === '/privacy-policy');
            setShowTermsOfService(window.location.pathname === '/terms-of-service');
            setShowLegalCenter(window.location.pathname === '/legal-center');
            setShowPublicHome(window.location.pathname === '/' && window.history.state?.publicHome === true);
            
            if (e?.state && e.state.activePage) {
                setActivePage(e.state.activePage);
            }
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

        // Check for Auth Callback
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (code && state && window.location.pathname === '/auth-callback') {
            console.log(`Processing real social redirect from ${state}`);
            
            const confirm = async () => {
                try {
                    const redirectUri = `${window.location.origin}/auth-callback`;
                    await socialConfirm(state, code, redirectUri);
                    // On success, history will be clean
                    window.history.replaceState({}, '', '/');
                } catch (err) {
                    console.error('Social login exchange failed', err);
                    alert('Social login failed. Please check your developer keys in .env');
                    window.history.replaceState({}, '', '/');
                }
            };
            confirm();
        }

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
    },
    onPricingClick: () => {
      setShowCookiesPolicy(false);
      setShowPrivacyPolicy(false);
      setShowTermsOfService(false);
      setShowLegalCenter(false);
      setShowPublicHome(false);
      window.history.pushState({}, '', '/');
      window.scrollTo(0, 0);
      setTimeout(() => {
        setActivePage('pricing');
      }, 50);
    },
    onDetectorClick: () => {
      setShowCookiesPolicy(false);
      setShowPrivacyPolicy(false);
      setShowTermsOfService(false);
      setShowLegalCenter(false);
      setShowPublicHome(false);
      window.history.pushState({}, '', '/');
      window.scrollTo(0, 0);
      setTimeout(() => {
        setActivePage('detector');
      }, 50);
    },
    onParaphraserClick: () => {
      setShowCookiesPolicy(false);
      setShowPrivacyPolicy(false);
      setShowTermsOfService(false);
      setShowLegalCenter(false);
      setShowPublicHome(false);
      window.history.pushState({}, '', '/');
      window.scrollTo(0, 0);
      setTimeout(() => {
        setActivePage('paraphraser');
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
          onGuestEntry={() => { setIsGuest(true); setShowPublicHome(false); navigateTo('detector'); }}
          onDashboardEntry={() => { setShowPublicHome(false); navigateTo('dashboard'); }}
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
          {isAuthenticated && (
            <button onClick={() => navigateTo('dashboard')} className={`p-2 rounded-lg transition-colors ${activePage === 'dashboard' ? 'bg-blue-50 dark:bg-white/10 text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
            </button>
          )}
          <button onClick={() => navigateTo('detector')} className={`p-2 rounded-lg transition-colors ${activePage === 'detector' ? 'bg-blue-50 dark:bg-white/10 text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </button>
          <button onClick={() => navigateTo('paraphraser')} className={`p-2 rounded-lg transition-colors ${activePage === 'paraphraser' ? 'bg-blue-50 dark:bg-white/10 text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
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
              onContactClick={() => navigateTo('contact')}
              onHelpClick={() => navigateTo('help')}
            />
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-x-hidden transition-all duration-300">
          <div className="w-full flex-1 flex flex-col">
            {activePage === 'dashboard' && <Dashboard />}
            {activePage === 'detector' && <Detector />}
            {activePage === 'paraphraser' && <Paraphraser initialText={paraphraserText} onTextConsumed={() => setParaphraserText('')} />}
            {activePage === 'pricing' && <PricingView onAuthRequest={() => window.dispatchEvent(new Event('open-auth-from-guest'))} />}
            {activePage === 'admin' && <AdminPage />}
            {activePage === 'contact' && <ContactSupport onBack={() => navigateTo('dashboard')} mode="contact" />}
            {activePage === 'help' && <ContactSupport onBack={() => navigateTo('dashboard')} mode="help" />}
          </div>

          {/* Paraphraser Promo Bar — styled like user request */}
          {activePage === 'detector' && (
            <div className="w-full max-w-full py-4 bg-[#f0f3ff] dark:bg-[#1a2035] border border-blue-100 dark:border-white/5 rounded-xl px-8 flex items-center justify-between animate-fade-in transition-all shrink-0 mt-6 shadow-sm">
              <span className="text-blue-500 dark:text-blue-300 font-bold text-[14px] tracking-tight">Want your text to sound more authentic?</span>
              <button
                onClick={() => {
                  window.dispatchEvent(new Event('grab-detector-text'));
                  setTimeout(() => navigateTo('paraphraser'), 50);
                }}
                className="bg-[#6B55FA] hover:bg-[#5A45E0] text-white px-6 py-2.5 rounded-full text-[13px] font-black tracking-wide hover:scale-105 transition-all flex items-center gap-2 shadow-md shadow-[#6B55FA]/30"
              >
                Refine with Paraphraser
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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
