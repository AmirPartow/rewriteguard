import React from 'react';

export default function LogoHomeButton({ onClick, className = "" }: { onClick?: () => void, className?: string }) {
    const handleClick = (e: React.MouseEvent) => {
        if (onClick) {
            e.preventDefault();
            onClick();
        } else {
            // Use window location if it is a normal navigation, but since it's SPA, we emit the event wrapper
            window.dispatchEvent(new Event('go-public-home'));
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`flex items-center gap-3 group cursor-pointer ${className}`}
            title="Go to Home"
        >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent tracking-tight">
                RewriteGuard
            </span>
        </button>
    );
}
