import Footer from './components/Footer';
import LogoHomeButton from './components/LogoHomeButton';

export default function PrivacyPolicy(props: any) {
    return (
        <div className="min-h-screen flex flex-col text-slate-700 dark:text-white bg-slate-50 dark:bg-[#0f172a]">
            <div className="flex-grow p-8 md:p-20">
                <div className="max-w-4xl mx-auto animate-fade-in-up">
                    <div className="mb-12">
                        <LogoHomeButton />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        RewriteGuard Privacy Policy
                    </h1>

                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-gray-300 leading-relaxed">
                        <p className="text-lg text-slate-500 dark:text-gray-400 mb-8 font-medium">Effective February 25, 2026</p>

                        <p className="mb-6">
                            Welcome to RewriteGuard, operated by <a href="https://www.p5solution.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">P5Solution</a>. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share information when you use our website, RewriteGuard.com, and related AI content detection and paraphrasing services (collectively, the "Services").
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">1. Information We Collect</h2>
                        <ul className="list-disc pl-6 space-y-2 mb-6">
                            <li><strong>Account Information:</strong> When you register, we collect your name, email address, and authentication credentials.</li>
                            <li><strong>Usage Data:</strong> We collect text interactions (e.g., text you submit for detection or paraphrasing). Our AI models process this to provide the Service.</li>
                            <li><strong>Automatically Collected Information:</strong> We automatically collect device information, IP addresses, browser types, and interaction metrics.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">2. How We Use Your Information</h2>
                        <ul className="list-disc pl-6 space-y-2 mb-6">
                            <li>To provide, maintain, and improve our Services, including our AI models.</li>
                            <li>To communicate with you regarding updates, support, and promotional offers.</li>
                            <li>To ensure the security of our platform and prevent fraud.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">3. Data Sharing and Disclosure</h2>
                        <p className="mb-6">
                            We do not sell your personal data. We may share your information only in the following situations:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mb-6">
                            <li><strong>Service Providers:</strong> We use third-party tools (like Stripe for payments or AWS for hosting) to operate our Services.</li>
                            <li><strong>Legal Compliance:</strong> We may disclose information if required by law or to protect our rights or users.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">4. Data Security</h2>
                        <p className="mb-6">
                            We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">5. Your Choices and Rights</h2>
                        <p className="mb-6">
                            Depending on your location (e.g., EEA, UK, California), you may have rights to access, update, or delete your personal information. To exercise these rights, please contact us.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">Contact Us</h2>
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-2xl inline-block w-full md:w-auto shadow-lg">
                            <p className="font-bold text-slate-900 dark:text-white text-lg">RewriteGuard (<a href="https://www.p5solution.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">P5Solution</a>)</p>
                            <p className="mt-2 text-slate-600 dark:text-gray-300"><span className="font-medium text-slate-500 dark:text-gray-400">Email:</span> <a href="mailto:rewritegaurd@p5solution.com" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">rewritegaurd@p5solution.com</a></p>
                            <p className="mt-2 text-slate-600 dark:text-gray-300"><span className="font-medium text-slate-500 dark:text-gray-400">Location:</span> North Vancouver, British Columbia, Canada</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer {...props} />
        </div>
    );
}
