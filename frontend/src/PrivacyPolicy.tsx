import Footer from './components/Footer';

export default function PrivacyPolicy(props: any) {
    return (
        <div className="min-h-screen flex flex-col text-white bg-[#0f172a]">
            <div className="flex-grow p-8 md:p-20">
                <div className="max-w-4xl mx-auto animate-fade-in-up">
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12 group"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </a>

                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        RewriteGuard Privacy Policy
                    </h1>

                    <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                        <p className="text-lg text-gray-400 mb-8 font-medium">Effective February 25, 2026</p>

                        <p className="mb-6">
                            Welcome to RewriteGuard, operated by <a href="https://www.p5solution.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">P5Solution</a>. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share information when you use our website, RewriteGuard.com, and related AI content detection and paraphrasing services (collectively, the "Services").
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-12 mb-4 border-b border-white/10 pb-2">1. Information We Collect</h2>
                        <ul className="list-disc pl-6 space-y-2 mb-6">
                            <li><strong>Account Information:</strong> When you register, we collect your name, email address, and authentication credentials.</li>
                            <li><strong>Usage Data:</strong> We collect text interactions (e.g., text you submit for detection or paraphrasing). Our AI models process this to provide the Service.</li>
                            <li><strong>Automatically Collected Information:</strong> We automatically collect device information, IP addresses, browser types, and interaction metrics.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-white mt-12 mb-4 border-b border-white/10 pb-2">2. How We Use Your Information</h2>
                        <ul className="list-disc pl-6 space-y-2 mb-6">
                            <li>To provide, maintain, and improve our Services, including our AI models.</li>
                            <li>To communicate with you regarding updates, support, and promotional offers.</li>
                            <li>To ensure the security of our platform and prevent fraud.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-white mt-12 mb-4 border-b border-white/10 pb-2">3. Data Sharing and Disclosure</h2>
                        <p className="mb-6">
                            We do not sell your personal data. We may share your information only in the following situations:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mb-6">
                            <li><strong>Service Providers:</strong> We use third-party tools (like Stripe for payments or AWS for hosting) to operate our Services.</li>
                            <li><strong>Legal Compliance:</strong> We may disclose information if required by law or to protect our rights or users.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-white mt-12 mb-4 border-b border-white/10 pb-2">4. Data Security</h2>
                        <p className="mb-6">
                            We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-12 mb-4 border-b border-white/10 pb-2">5. Your Choices and Rights</h2>
                        <p className="mb-6">
                            Depending on your location (e.g., EEA, UK, California), you may have rights to access, update, or delete your personal information. To exercise these rights, please contact us.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-12 mb-4 border-b border-white/10 pb-2">Contact Us</h2>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl inline-block w-full md:w-auto">
                            <p className="font-bold text-white text-lg">RewriteGuard (<a href="https://www.p5solution.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">P5Solution</a>)</p>
                            <p className="mt-2 text-gray-300"><span className="font-medium text-gray-400">Email:</span> <a href="mailto:rewriteguard@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">rewriteguard@gmail.com</a></p>
                            <p className="mt-2 text-gray-300"><span className="font-medium text-gray-400">Location:</span> North Vancouver, British Columbia, Canada</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer {...props} />
        </div>
    );
}
