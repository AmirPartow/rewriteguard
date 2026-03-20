import { useState } from 'react';

interface PricingViewProps {
    onAuthRequest: () => void;
}

export default function PricingView({ onAuthRequest }: PricingViewProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [showComparison, setShowComparison] = useState(false);

    const premiumPrice = billingCycle === 'annual' ? 5.25 : 7.33;
    const studentPrice = 5.25;

    const handleStudentClick = () => {
        alert('Student email verification initiated. Please check your .edu email after signing up.');
        onAuthRequest();
    };

    return (
        <main className="relative z-10 w-full px-4 md:px-12 py-32 animate-fade-in-up min-h-[70vh] flex flex-col items-center">
            <div className="text-center mb-20 px-6 max-w-4xl">
                <h2 className="text-5xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white transition-colors tracking-tight">Simple, Transparent Pricing</h2>
                <p className="text-xl md:text-2xl text-slate-500 dark:text-gray-400 font-medium transition-colors mb-12">Choose the plan that's right for your content needs.</p>
                
                {/* Billing Toggle - Monthly First */}
                <div className="inline-flex items-center bg-gray-100 dark:bg-slate-800/80 p-1 rounded-full border border-gray-200 dark:border-slate-700/50">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                            billingCycle === 'monthly'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('annual')}
                        className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                            billingCycle === 'annual'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        Annually (Save 15%)
                    </button>
                </div>
            </div>

            {/* Top Cards Grid - Wider and taller cards */}
            <div className={`max-w-7xl mx-auto w-full px-6 grid gap-8 lg:gap-10 mb-20 ${billingCycle === 'monthly' ? 'md:grid-cols-3' : 'md:grid-cols-1 max-w-lg'}`}>
                {/* Free Plan - Only Montly */}
                {billingCycle === 'monthly' && (
                    <div className="bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/50 rounded-3xl p-8 flex flex-col hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-all shadow-sm">
                        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white text-center">Free</h3>
                        <div className="flex flex-col items-center justify-center mb-6 h-24">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">USD</span>
                            </div>
                            <span className="text-sm font-medium text-slate-500 dark:text-gray-400">Per month</span>
                        </div>
                        <button
                            onClick={onAuthRequest}
                            className="w-full py-3.5 bg-white dark:bg-slate-800 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-full font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                        >
                            Sign up
                        </button>
                    </div>
                )}

                {/* Premium Plan - Focused Column (Always Shown) */}
                <div className="bg-white dark:bg-slate-800/40 border-2 border-blue-600 dark:border-blue-500 rounded-3xl p-8 flex flex-col relative shadow-xl shadow-blue-500/10">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 whitespace-nowrap">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        {billingCycle === 'annual' ? 'Premium Annual' : 'Premium'}
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-400 text-center mt-2">Premium</h3>
                    <div className="flex flex-col items-center justify-center mb-6 h-24">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">${premiumPrice.toFixed(2)}</span>
                            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">USD</span>
                        </div>
                        <span className="text-sm font-medium text-slate-500 dark:text-gray-400 text-center">
                            Per month{billingCycle === 'annual' ? ', billed annually' : ''}
                        </span>
                    </div>
                    <button
                        onClick={onAuthRequest}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold hover:brightness-110 transition-all shadow-md"
                    >
                        Upgrade
                    </button>
                </div>

                {/* Student Plan - Only Monthly */}
                {billingCycle === 'monthly' && (
                    <div className="bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/50 rounded-3xl p-8 flex flex-col hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-all shadow-sm">
                        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white text-center">Student Plan</h3>
                        <div className="flex flex-col items-center justify-center mb-6 h-24">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-slate-900 dark:text-white">${studentPrice.toFixed(2)}</span>
                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">USD</span>
                            </div>
                            <span className="text-sm font-medium text-slate-500 dark:text-gray-400">Per month</span>
                        </div>
                        <button
                            onClick={handleStudentClick}
                            className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-full font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-sm leading-tight shadow-sm"
                        >
                            Verify Student Email
                        </button>
                    </div>
                )}
            </div>

            {/* "And Much More" Expander */}
            <div className="text-center max-w-6xl mx-auto w-full px-6">
                {!showComparison && (
                    <button
                        onClick={() => setShowComparison(true)}
                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-8 py-3 rounded-full font-bold text-slate-700 dark:text-white shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 mx-auto"
                    >
                        Compare all features
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                )}
            </div>

            {/* Detailed Comparison Table */}
            {showComparison && (
                <div className="max-w-6xl mx-auto w-full px-6 mt-12 animate-fade-in-up">
                    <div className="bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
                        
                        {/* Table Header Wrapper for Mobile scrolling if needed */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr>
                                        <th className="p-6 border-b border-gray-100 dark:border-slate-700/50 w-2/5"></th>
                                        <th className="p-6 border-b border-gray-100 dark:border-slate-700/50 text-center font-bold text-slate-900 dark:text-white w-1/5">Free</th>
                                        <th className="p-6 border-b border-gray-100 dark:border-slate-700/50 text-center font-bold text-blue-600 dark:text-blue-400 w-1/5">Premium</th>
                                        <th className="p-6 border-b border-gray-100 dark:border-slate-700/50 text-center font-bold text-slate-900 dark:text-white w-1/5">Student Plan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                                        <td colSpan={4} className="p-4 font-black text-slate-900 dark:text-blue-500 uppercase tracking-wider text-[11px]">Rewriting</td>
                                    </tr>
                                    <TableRow feature="Paraphrase your writing" free="Up to 1,000 words/day" premium="Unlimited" student="Unlimited" />
                                    <TableRow feature="Paraphraser modes" free="Standard and Fluency" premium="5 unique modes" student="5 unique modes" />
                                    <TableRow feature="Access Paraphraser History" free={false} premium={true} student={true} isBg />

                                    <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                                        <td colSpan={4} className="p-4 font-black text-slate-900 dark:text-blue-500 uppercase tracking-wider text-[11px] mt-4">Refining & Detection</td>
                                    </tr>
                                    <TableRow feature="Detect AI-generated content" free="Standard priority" premium="Highest priority limits" student="Highest priority limits" />
                                    <TableRow feature="Detailed sentence-by-sentence highlights" free={true} premium={true} student={true} isBg />
                                    
                                    <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                                        <td colSpan={4} className="p-4 font-black text-slate-900 dark:text-blue-500 uppercase tracking-wider text-[11px] mt-4">Customer Support</td>
                                    </tr>
                                    <TableRow feature="Help center & Community" free={true} premium={true} student={true} />
                                    <TableRow feature="Priority assistance" free={false} premium={true} student={true} isBg />
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function TableRow({ feature, free, premium, student, isBg = false }: { feature: string, free: React.ReactNode, premium: React.ReactNode, student: React.ReactNode, isBg?: boolean }) {
    const renderCell = (value: React.ReactNode) => {
        if (value === true) {
            return <svg className="w-5 h-5 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>;
        }
        if (value === false) {
            return <svg className="w-5 h-5 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>;
        }
        return <span className="text-sm font-medium text-slate-600 dark:text-gray-300">{value}</span>;
    };

    return (
        <tr className={`border-b border-gray-50 dark:border-slate-700/30 hover:bg-gray-50/80 dark:hover:bg-slate-700/20 transition-colors ${isBg ? 'bg-gray-50/30 dark:bg-slate-800/20' : ''}`}>
            <td className="p-4 pl-6 text-sm font-medium text-slate-700 dark:text-gray-300 flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-100 dark:bg-blue-500/20 rounded flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                {feature}
            </td>
            <td className="p-4 text-center">{renderCell(free)}</td>
            <td className="p-4 text-center">{renderCell(premium)}</td>
            <td className="p-4 text-center">{renderCell(student)}</td>
        </tr>
    );
}
