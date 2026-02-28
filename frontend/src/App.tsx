import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import UserMenu from './UserMenu';
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

type ActivePage = 'dashboard' | 'detector' | 'paraphraser' | 'admin' | 'contact';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [isGuest, setIsGuest] = useState(false);
  const [showCookiesPolicy, setShowCookiesPolicy] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showLegalCenter, setShowLegalCenter] = useState(false);

  // Listen for hash change or custom events to show policy
  useEffect(() => {
    const handlePopState = () => {
      setShowCookiesPolicy(window.location.pathname === '/cookies-policy');
      setShowPrivacyPolicy(window.location.pathname === '/privacy-policy');
      setShowTermsOfService(window.location.pathname === '/terms-of-service');
      setShowLegalCenter(window.location.pathname === '/legal-center');
    };

    // Allow guest mode to trigger auth flow
    const handleGuestAuth = () => {
      setIsGuest(false);
      setTimeout(() => window.dispatchEvent(new Event('open-auth')), 50);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('open-auth-from-guest', handleGuestAuth);
    handlePopState();
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('open-auth-from-guest', handleGuestAuth);
    };
  }, []);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handlePolicyNav = (path: string, setter: (val: boolean) => void) => {
    setShowCookiesPolicy(false);
    setShowPrivacyPolicy(false);
    setShowTermsOfService(false);
    setShowLegalCenter(false);
    window.history.pushState({}, '', path);
    setter(true);
    window.scrollTo(0, 0);
  };

  const footerProps = {
    onShowPolicy: () => handlePolicyNav('/cookies-policy', setShowCookiesPolicy),
    onPrivacyClick: () => handlePolicyNav('/privacy-policy', setShowPrivacyPolicy),
    onTermsClick: () => handlePolicyNav('/terms-of-service', setShowTermsOfService),
    onLegalClick: () => handlePolicyNav('/legal-center', setShowLegalCenter),
    onContactClick: () => {
      setShowCookiesPolicy(false);
      setShowPrivacyPolicy(false);
      setShowTermsOfService(false);
      setShowLegalCenter(false);
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
    return (
      <>
        <CookiesPolicy {...footerProps} />
        <CookieConsent />
      </>
    );
  }

  // Handle Privacy Policy View
  if (showPrivacyPolicy) {
    return (
      <>
        <PrivacyPolicy {...footerProps} />
        <CookieConsent />
      </>
    );
  }

  // Handle Terms of Service View
  if (showTermsOfService) {
    return (
      <>
        <TermsOfService {...footerProps} />
        <CookieConsent />
      </>
    );
  }

  // Handle Legal Center View
  if (showLegalCenter) {
    return (
      <>
        <LegalCenter {...footerProps} />
        <CookieConsent />
      </>
    );
  }

  // Show Landing Page if not authenticated AND not in guest mode
  if (!isAuthenticated && !isGuest) {
    return (
      <>
        <LandingPage
          onGuestEntry={() => { setIsGuest(true); setActivePage('detector'); }}
          {...footerProps}
        />
        <CookieConsent />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-8 bg-[#0f172a] text-white">
      <div className="w-full max-w-4xl flex flex-col min-h-screen">

        {/* Header with User Menu */}
        <header className="flex justify-between items-center mb-8">
          {/* Logo — click to go home */}
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setActivePage('dashboard')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              RewriteGuard
            </span>
          </div>

          {/* User Menu or Sign In */}
          {user ? <UserMenu /> : (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-400 hidden sm:block">Guest Mode</span>
              <button
                onClick={() => window.dispatchEvent(new Event('open-auth-from-guest'))}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/25 hover:scale-105 active:scale-95 text-white font-bold text-sm rounded-xl transition-all"
              >
                Sign In / Sign Up
              </button>
            </div>
          )}
        </header>

        {/* Navigation Tabs */}
        <nav className="mb-8 flex justify-center">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-1.5 inline-flex gap-1 shadow-xl flex-wrap justify-center">
            {user && (
              <button
                onClick={() => setActivePage('dashboard')}
                className={`
                  px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm
                  ${activePage === 'dashboard'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                Dashboard
              </button>
            )}
            <button
              onClick={() => setActivePage('detector')}
              className={`
                px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm
                ${activePage === 'detector'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Detector
            </button>
            <button
              onClick={() => setActivePage('paraphraser')}
              className={`
                px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm
                ${activePage === 'paraphraser'
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Paraphraser
            </button>
            {user?.email === 'amir.ap.partow@gmail.com' && (
              <button
                onClick={() => setActivePage('admin')}
                className={`
                px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm
                ${activePage === 'admin'
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                  }
              `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin
              </button>
            )}
          </div>
        </nav>

        <main className="animate-fade-in flex-grow">
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'detector' && <Detector />}
          {activePage === 'paraphraser' && <Paraphraser />}
          {activePage === 'admin' && <AdminPage />}
          {activePage === 'contact' && <ContactSupport onBack={() => setActivePage('dashboard')} />}
        </main>

        <Footer
          {...footerProps}
          className="mt-20 -mx-4 sm:-mx-8 rounded-t-3xl border-white/5 opacity-80"
        />
        <CookieConsent />
      </div>
    </div>
  );
}

export default App;
