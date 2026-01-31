import { useState } from 'react';
import { useAuth } from './AuthContext';
import AuthForm from './AuthForm';
import UserMenu from './UserMenu';
import UsageDisplay from './UsageDisplay';
import Detector from './Detector';
import Paraphraser from './Paraphraser';

type ActivePage = 'detector' | 'paraphraser';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activePage, setActivePage] = useState<ActivePage>('detector');

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-8">
      <div className="w-full max-w-4xl">

        {/* Header with User Menu */}
        <header className="flex justify-between items-center mb-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              RewriteGuard
            </span>
          </div>

          {/* User Menu */}
          <UserMenu />
        </header>

        {/* Navigation Tabs */}
        <nav className="mb-8 flex justify-center">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-1.5 inline-flex gap-1 shadow-xl">
            <button
              onClick={() => setActivePage('detector')}
              className={`
                px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2.5
                ${activePage === 'detector'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Detector
            </button>
            <button
              onClick={() => setActivePage('paraphraser')}
              className={`
                px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2.5
                ${activePage === 'paraphraser'
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Paraphraser
            </button>
          </div>
        </nav>

        {/* Usage Stats */}
        <UsageDisplay />

        {/* Page Content */}
        <main className="animate-fade-in">
          {activePage === 'detector' ? <Detector /> : <Paraphraser />}
        </main>

      </div>
    </div>
  );
}

export default App;
