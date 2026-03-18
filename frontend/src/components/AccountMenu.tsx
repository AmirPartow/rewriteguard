import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';

interface AccountMenuProps {
    onLoginClick?: () => void;
    onContactClick?: () => void;
    onHelpClick?: () => void;
}

export default function AccountMenu({ onLoginClick, onContactClick, onHelpClick }: AccountMenuProps) {
    const { user, logout, isAuthenticated } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.[0].toUpperCase() || '?';

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer border border-gray-200 dark:border-white/10 overflow-hidden"
            >
                {isAuthenticated && user ? (
                   <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {initials}
                   </div>
                ) : (
                    <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-[100]">
                    <div className="p-2 space-y-1">
                        {/* Auth Section */}
                        {!isAuthenticated ? (
                            <button
                                onClick={() => { setIsOpen(false); onLoginClick?.(); }}
                                className="w-full px-4 py-3 flex items-center gap-4 text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors group text-left"
                            >
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-slate-500 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <span className="font-semibold text-[15px]">Login / Sign Up</span>
                            </button>
                        ) : (
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 mb-2">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.full_name || 'User'}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                            </div>
                        )}

                        <div className="h-px bg-gray-100 dark:bg-slate-800 mx-2 my-1" />

                        {/* Language Section */}
                        <div className="px-4 py-3 flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                </div>
                                <span className="font-semibold text-[15px] text-slate-700 dark:text-slate-200">English</span>
                            </div>
                            <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>

                        {/* Theme Toggle Section */}
                        <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-slate-400' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {theme === 'dark' ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h1m-19 0h1m3.34 7.08l.707.707m12.728-12.728l.707.707M6.34 6.34l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                                        )}
                                    </svg>
                                </div>
                                <span className="font-semibold text-[15px] text-slate-700 dark:text-slate-200">Dark mode</span>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="h-px bg-gray-100 dark:bg-slate-800 mx-2 my-1" />

                        {/* Help Section */}
                        <button
                            onClick={() => { setIsOpen(false); onHelpClick?.(); }}
                            className="w-full px-4 py-3 flex items-center gap-4 text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors group text-left"
                        >
                            <div className="w-6 h-6 flex items-center justify-center">
                                <svg className="w-6 h-6 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="font-semibold text-[15px]">Help Center</span>
                        </button>

                        {/* Contact Section */}
                        <button
                            onClick={() => { setIsOpen(false); onContactClick?.(); }}
                            className="w-full px-4 py-3 flex items-center gap-4 text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors group text-left"
                        >
                            <div className="w-6 h-6 flex items-center justify-center">
                                <svg className="w-6 h-6 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="font-semibold text-[15px]">Contact us</span>
                        </button>

                        {isAuthenticated && (
                            <>
                                <div className="h-px bg-gray-100 dark:bg-slate-800 mx-2 my-1" />
                                <button
                                    onClick={async () => { setIsOpen(false); await logout(); }}
                                    className="w-full px-4 py-3 flex items-center gap-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors group text-left"
                                >
                                    <div className="w-8 h-8 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </div>
                                    <span className="font-semibold text-[15px]">Sign Out</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
