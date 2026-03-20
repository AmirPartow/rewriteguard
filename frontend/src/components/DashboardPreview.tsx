import React from 'react';

export default function DashboardPreview() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header / Navbar Mockup inside preview */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-white/5 transition-colors">
                <div className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">RewriteGuard</span>
                    <span className="text-gray-300 dark:text-gray-600 font-bold mx-1">/</span>
                    <span className="text-slate-500 dark:text-gray-400 font-medium text-sm">Dashboard</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">JP</div>
            </div>

            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/20 dark:to-purple-600/20 border border-blue-200 dark:border-blue-400/20 rounded-2xl p-6 relative transition-colors shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2 transition-colors">
                            Welcome back, Jacob Partow! 👋
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 font-medium transition-colors">
                            Here's your usage overview for today
                        </p>
                    </div>
                    <button className="px-3 py-1.5 bg-white/80 dark:bg-white/5 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-bold shadow-sm transition-colors">
                        Test Trustpilot AFS
                    </button>
                </div>
            </div>

            {/* Stats Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <PreviewStatCard title="Words Today" value="0" icon="📝" color="blue" />
                <PreviewStatCard title="Remaining" value="10,000" icon="⏳" color="green" />
                <PreviewStatCard title="Total Jobs" value="0" icon="📊" color="purple" />
                <PreviewStatCard title="Words Processed" value="0" icon="✨" color="cyan" />
            </div>

            {/* Main Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                {/* Usage Detail */}
                <div className="bg-white dark:bg-slate-800/40 border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm transition-all duration-500 hover:shadow-xl">
                    <h2 className="text-md font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2 transition-colors uppercase tracking-tight">
                        <span className="text-xl">📈</span> Daily Usage
                    </h2>
                    <div className="flex items-center justify-between mb-8">
                        <div className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-black shadow-lg shadow-amber-500/20">
                            ⭐ Premium Plan
                        </div>
                        <span className="text-slate-400 dark:text-gray-500 text-[10px] font-bold">10,000 words/day</span>
                    </div>
                    <div>
                        <div className="flex justify-between text-[10px] mb-3 font-bold text-slate-400 dark:text-gray-500 uppercase">
                            <span>Usage</span>
                            <span>0%</span>
                        </div>
                        <div className="h-2.5 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden mb-6 transition-colors">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full w-[2%] shadow-sm"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-6 mt-4 border-t border-gray-100 dark:border-white/5">
                        <div className="text-center">
                            <p className="text-xl font-black text-blue-600">0</p>
                            <p className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider mt-0.5">🔍 Detection</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-black text-emerald-600">0</p>
                            <p className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider mt-0.5">✍️ Paraphrase</p>
                        </div>
                    </div>
                </div>

                {/* Job Empty State */}
                <div className="bg-white dark:bg-slate-800/40 border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm transition-all duration-500 hover:shadow-xl flex flex-col items-center justify-center min-h-[220px]">
                    <h2 className="text-md font-black text-slate-800 dark:text-white mb-auto w-full flex items-center gap-2 transition-colors uppercase tracking-tight">
                        <span className="text-xl">📋</span> Recent Jobs
                    </h2>
                    <div className="text-center py-6">
                        <div className="text-3xl mb-4 opacity-50">🚀</div>
                        <p className="text-slate-400 dark:text-gray-500 font-bold text-[11px] max-w-[180px] mx-auto leading-relaxed uppercase tracking-tight">
                            No jobs yet. Start analyzing or paraphrasing text!
                        </p>
                    </div>
                    <div className="mt-auto h-1 w-20 bg-gray-100 dark:bg-white/5 rounded-full transition-colors"></div>
                </div>
            </div>

            {/* Dashboard Footer Preview Section */}
            <div className="pt-24 mt-12 grid grid-cols-4 gap-8 border-t border-gray-100 dark:border-white/5 text-[10px] pb-8">
                 <div className="space-y-4">
                     <p className="font-black text-slate-800 dark:text-gray-400 uppercase tracking-widest text-[9px]">Premium</p>
                     <div className="flex flex-col gap-2.5 text-slate-400 dark:text-gray-500 font-bold transition-all">
                        <span>Pricing</span>
                        <span>Plan Details</span>
                        <span>For Teams</span>
                        <span>Affiliates</span>
                        <span>Request a Demo</span>
                     </div>
                 </div>
                 <div className="space-y-4">
                     <p className="font-black text-slate-800 dark:text-gray-400 uppercase tracking-widest text-[9px]">Tools</p>
                     <div className="flex flex-col gap-2.5 text-slate-400 dark:text-gray-500 font-bold transition-all">
                        <span>AI Content Detector</span>
                        <span>AI Paraphraser</span>
                        <span>Content Humanizer</span>
                        <span>Citing & Originality</span>
                        <span>Plagiarism Checker</span>
                     </div>
                 </div>
                 <div className="space-y-4">
                     <p className="font-black text-slate-800 dark:text-gray-400 uppercase tracking-widest text-[9px]">Company</p>
                     <div className="flex flex-col gap-2.5 text-slate-400 dark:text-gray-500 font-bold transition-all">
                        <span>About Us</span>
                        <span>Trust Center</span>
                        <span>Help Center</span>
                        <span>Contact Us</span>
                     </div>
                 </div>
                 <div className="space-y-4 text-center border-l dark:border-white/5">
                     <p className="font-black text-slate-800 dark:text-gray-400 uppercase tracking-widest text-[9px]">Follow us on social</p>
                     <div className="flex justify-center gap-6 mt-4">
                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/5 opacity-40"></div>
                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/5 opacity-40"></div>
                     </div>
                 </div>
            </div>
        </div>
    );
}

function PreviewStatCard({ title, value, icon, color }: { title: string, value: string, icon: string, color: string }) {
    const colorClasses: any = {
        blue: 'from-blue-500/5 to-blue-600/5 dark:from-blue-500/10 dark:to-blue-600/10 border-blue-100 dark:border-blue-400/20 shadow-blue-500/5',
        green: 'from-emerald-500/5 to-emerald-600/5 dark:from-emerald-500/10 dark:to-emerald-600/10 border-emerald-100 dark:border-emerald-400/20 shadow-emerald-500/5',
        purple: 'from-purple-500/5 to-purple-600/5 dark:from-purple-500/10 dark:to-purple-600/10 border-purple-100 dark:border-purple-400/20 shadow-purple-500/5',
        cyan: 'from-cyan-500/5 to-cyan-600/5 dark:from-cyan-500/10 dark:to-cyan-600/10 border-cyan-100 dark:border-cyan-400/20 shadow-cyan-500/5',
        red: 'from-red-500/5 to-red-600/5 dark:from-red-500/10 dark:to-red-600/10 border-red-100 dark:border-red-400/20 shadow-red-500/5',
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-[1.5rem] p-4 shadow-sm group-hover:shadow-md transition-all duration-500`}>
            <div className="text-xl mb-2">{icon}</div>
            <p className="text-xl font-black text-slate-800 dark:text-white transition-colors tracking-tight">{value}</p>
            <p className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">{title}</p>
        </div>
    );
}
