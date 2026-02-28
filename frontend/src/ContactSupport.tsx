import { useState } from 'react';
import { API_BASE_URL } from './config';

interface ContactSupportProps {
    onBack: () => void;
}

export default function ContactSupport({ onBack }: ContactSupportProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('category', category);
            formData.append('sub_category', subCategory);
            formData.append('subject', subject);
            formData.append('description', description);
            if (selectedFile) {
                formData.append('attachment', selectedFile);
            }

            const response = await fetch(`${API_BASE_URL}/v1/support/submit`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to submit request');
            setSubmitted(true);
        } catch (err) {
            setError('Something went wrong. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto p-12 bg-white/5 border border-white/10 rounded-[2.5rem] text-center animate-fade-in">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold mb-4">Request Received!</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    Thank you for contacting RewriteGuard support. We've received your request and our team will get back to you at <strong>{email}</strong> as soon as possible.
                </p>
                <button
                    onClick={onBack}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 animate-fade-in-up">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <span>RewriteGuard Help Center</span>
                        <span>›</span>
                        <span className="text-gray-300">Submit a request</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Contact support</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 border border-white/10 p-8 rounded-[2rem]">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-400 ml-1">Select a category to help us find the right solution for you.</label>
                        <select
                            required
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                if (e.target.value !== 'Technical issue') setSubCategory('');
                            }}
                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none transition-all cursor-pointer"
                        >
                            <option value="">-</option>
                            <option value="Technical issue">Technical issue</option>
                            <option value="Membership/Account">Unable to access Premium</option>
                            <option value="Manage account">Manage account</option>
                            <option value="Login errors">Login errors</option>
                            <option value="Payment issue">Payment issue</option>
                            <option value="Cancellation">Cancellation and refund</option>
                            <option value="General feedback">General questions, feedback, and other requests</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-400 ml-1">Full Name</label>
                            <input
                                required
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                placeholder="Jane Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-400 ml-1">Email Address</label>
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                placeholder="jane@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-400 ml-1">Subject <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
                        />
                    </div>

                    {category === 'Technical issue' && (
                        <div className="space-y-2 animate-fade-in-down">
                            <label className="text-sm font-semibold text-gray-400 ml-1">I want to report an issue for: <span className="text-red-500">*</span></label>
                            <select
                                required
                                value={subCategory}
                                onChange={(e) => setSubCategory(e.target.value)}
                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none transition-all cursor-pointer"
                            >
                                <option value="">-</option>
                                <option value="Paraphraser">Paraphraser</option>
                                <option value="Grammar Checker">Grammar Checker</option>
                                <option value="Plagiarism Checker">Plagiarism Checker</option>
                                <option value="RewriteGuard Flow">RewriteGuard Flow</option>
                                <option value="Citation Generator">Citation Generator</option>
                                <option value="AI Detector">AI Detector</option>
                            </select>
                            <p className="text-xs text-gray-500 ml-1">Select the product you are facing an issue with.</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-400 ml-1">Description <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <textarea
                                required
                                rows={8}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1">Please enter the details of your request. A member of our support staff will respond as soon as possible.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-400 ml-1">Attachments <span className="text-gray-500 font-normal">(optional)</span></label>
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setSelectedFile(file);
                            }}
                        />
                        <div
                            onClick={() => !selectedFile && document.getElementById('file-upload')?.click()}
                            className={`w-full border-2 border-dashed rounded-2xl p-4 flex items-center justify-center transition-all ${selectedFile
                                ? 'border-emerald-500/50 bg-emerald-500/10'
                                : 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer group'
                                }`}
                        >
                            <div className="text-sm text-gray-400 flex items-center gap-3">
                                {selectedFile ? (
                                    <>
                                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-white font-medium">{selectedFile.name}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFile(null);
                                            }}
                                            className="text-red-400 hover:text-red-300 ml-2 underline underline-offset-4"
                                        >
                                            Remove
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-emerald-500 font-semibold group-hover:underline">Add file</span> or drop files here
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm animate-shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-32 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all ${isSubmitting
                            ? 'bg-emerald-600/50 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500'
                            }`}
                    >
                        {isSubmitting ? (
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Submit'}
                    </button>
                </form>
            </div>

            {/* Sidebar Cards */}
            <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-[1.5rem] hover:bg-white/10 transition-all cursor-pointer group">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Chat to support</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">Need a hand? Chat with our support team for quick assistance.</p>
                </div>

                <a href="https://discord.gg/qfDKsNTp" target="_blank" rel="noopener noreferrer" className="block bg-white/5 border border-white/10 p-6 rounded-[1.5rem] hover:bg-white/10 transition-all cursor-pointer group">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Join Discord</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">Join our Discord community for updates, discussions, and more.</p>
                </a>

                <div className="bg-white/5 border border-white/10 p-6 rounded-[1.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl rounded-full"></div>
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2">RewriteGuard Office</h3>
                    <p className="text-sm text-gray-300 font-semibold mb-1">Vancouver</p>
                    <p className="text-sm text-gray-400 leading-relaxed">143 21st stree East north vancouver</p>
                    <p className="text-sm text-gray-400">Canada, BC, V7L 3B5</p>
                </div>
            </div>
        </div>
    );
}
