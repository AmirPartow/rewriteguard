/**
 * User profile dropdown component for authenticated users.
 */
import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';

export default function UserMenu() {
    const { user, logout } = useAuth();
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

    if (!user) return null;

    const initials = user.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email[0].toUpperCase();

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                id="user-menu-button"
                className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl transition-all duration-300"
            >
                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                    {initials}
                </div>

                {/* Name/Email */}
                <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-white truncate max-w-[120px]">
                        {user.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-[120px]">
                        {user.email}
                    </p>
                </div>

                {/* Chevron */}
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden animate-fade-in z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-slate-700">
                        <p className="text-sm font-medium text-white">{user.full_name || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <button
                            onClick={async () => {
                                setIsOpen(false);
                                await logout();
                            }}
                            id="logout-button"
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-3"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
