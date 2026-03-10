import Footer from './components/Footer';

export default function TermsOfService(props: any) {
    return (
        <div className="min-h-screen flex flex-col text-white bg-[#0f172a]">
            {/* Header Area */}
            <div className="bg-gradient-to-b from-blue-900/20 to-[#0f172a] pt-20 pb-16 px-6 text-center border-b border-white/5">
                <div className="max-w-4xl mx-auto animate-fade-in-up">
                    <a
                        href="/legal-center"
                        className="inline-flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors mb-10 group"
                        onClick={() => {
                            if (window.location.pathname !== '/legal-center') {
                                // Default behavior if they are viewing via App.tsx state management, or just simple href routing
                            }
                        }}
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Legal Center
                    </a>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        RewriteGuard Terms of Service
                    </h1>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow p-8 md:p-12 mb-20">
                <div className="max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full"></div>

                        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed font-medium space-y-6 relative z-10">

                            <p className="p-4 bg-white/5 border border-white/10 rounded-xl text-blue-200">
                                If your country of residence is within the European Economic Area (“EEA”) or the United Kingdom, additional consumer terms may apply to you. See Section 16 (EEA/UK Notice).
                            </p>

                            <div className="flex flex-col md:flex-row gap-4 mb-8 text-sm text-gray-400 border-b border-white/10 pb-6">
                                <div><strong className="text-white">Last updated:</strong> February 26, 2026</div>
                                <div className="hidden md:block">•</div>
                                <div><strong className="text-white">Effective date:</strong> February 26, 2026</div>
                            </div>

                            <p>
                                Welcome to RewriteGuard. These Terms of Service (“Terms”) govern your access to and use of the RewriteGuard website and related products and services, including any website features, mobile features (if offered), extensions, widgets, or APIs (collectively, the “Service”).
                            </p>

                            <p>
                                The Service is provided by <a href="https://www.p5solution.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">P5Solution</a> (“RewriteGuard,” “we,” “us,” or “our”), located in North Vancouver, British Columbia, Canada.
                            </p>

                            <ul className="list-none pl-0 space-y-2 !mb-10 text-sm bg-black/20 p-6 rounded-2xl border border-white/5">
                                <li><strong className="text-white">Website:</strong> <a href="https://www.rewriteguard.com" className="text-blue-400 hover:text-blue-300 transition-colors">https://www.rewriteguard.com/</a></li>
                                <li><strong className="text-white">Privacy contact:</strong> <a href="mailto:rewriteguard@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">rewriteguard@gmail.com</a></li>
                            </ul>

                            <h2 className="text-2xl font-bold text-white mt-12 mb-4">1) Acceptance of Terms</h2>
                            <p>
                                By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, you must not use the Service.
                            </p>
                            <p>
                                You confirm that you are able to form a binding contract under the laws where you live and that you will comply with these Terms and all applicable laws.
                            </p>

                            <h2 className="text-2xl font-bold text-white mt-12 mb-4">2) Changes to These Terms</h2>
                            <p>
                                We may update these Terms from time to time by posting an updated version on our website. The “Last updated” date at the top will change when we do. If we make a material change, we will provide notice as required by applicable law.
                            </p>

                            <h2 className="text-2xl font-bold text-white mt-12 mb-4">3) Accounts and Security</h2>
                            <p>Certain features may require you to create an account. You agree to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>provide accurate and current information,</li>
                                <li>keep your login credentials confidential, and</li>
                                <li>be responsible for all activity under your account (including unauthorized use).</li>
                            </ul>
                            <p>
                                If you think your account has been compromised, contact us immediately at <a href="mailto:rewriteguard@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">rewriteguard@gmail.com</a>.
                            </p>

                            <h2 className="text-2xl font-bold text-white mt-12 mb-4">4) Using the Service and Restrictions</h2>
                            <p>You may use the Service only for lawful purposes and in accordance with these Terms.</p>
                            <p>You must not do, attempt to do, encourage, or assist others in doing any of the following:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong className="text-white">Resell or share access:</strong> rent, lease, sell, sublicense, distribute, or otherwise make the Service available to any third party, except if we explicitly allow it in writing.</li>
                                <li><strong className="text-white">Benchmarking:</strong> use the Service for performance testing or benchmarking without our written permission.</li>
                                <li><strong className="text-white">Competitive use:</strong> use the Service to build, market, or improve a competing product or service.</li>
                                <li><strong className="text-white">Scraping / automated extraction:</strong> scrape, crawl, harvest, or use automated methods to extract data or content from the Service except through an approved API (if we offer one) or with our written permission.</li>
                                <li><strong className="text-white">Reverse engineering:</strong> reverse engineer, decompile, disassemble, or attempt to discover the source code or underlying models/algorithms, except where prohibited by law.</li>
                                <li><strong className="text-white">Security interference:</strong> bypass access controls, probe vulnerabilities, or interfere with the Service’s operation or security.</li>
                                <li><strong className="text-white">Collect personal information:</strong> use the Service to collect, store, or distribute personal information about others without lawful basis and consent where required.</li>
                                <li><strong className="text-white">Institution policy violations:</strong> use the Service in violation of your employer’s, school’s, or institution’s rules.</li>
                                <li><strong className="text-white">Illegal or harmful content:</strong> submit content that is unlawful, infringing, deceptive, hateful, or violates third-party rights.</li>
                                <li><strong className="text-white">Training other systems:</strong> unless we explicitly permit it in writing, use or keep content from the Service to create, train, or improve AI/ML systems (including detectors, translation/paraphrasing systems, or comparable technologies).</li>
                            </ul>
                            <p>We may limit usage, throttle requests, or restrict access to protect users, the Service, and our systems.</p>

                            <h2 className="text-2xl font-bold text-white mt-12 mb-4">5) Your Content (Input and Output)</h2>
                            <p>The Service allows you to submit text (“Input”) and receive rewritten or improved text (“Output”). Input and Output are “User Content.”</p>
                            <h3 className="text-lg font-bold text-white mt-6 mb-2">Ownership and responsibility</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>You retain any rights you have in your Input.</li>
                                <li>You are responsible for the Input you submit and how you use the Output.</li>
                                <li>Output may not be unique and may be similar to Output generated for other users.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-white mt-6 mb-2">Accuracy</h3>
                            <p>
                                We do not guarantee Output is accurate, complete, or error-free. You are responsible for reviewing and verifying Output before using it, especially for academic, legal, medical, financial, or professional uses.
                            </p>
                            <h3 className="text-lg font-bold text-white mt-6 mb-2">License to operate the Service</h3>
                            <p>
                                You grant RewriteGuard a limited license to host, process, and transmit your Input and Output only as needed to provide, maintain, secure, and improve the Service and to comply with law, as described in our Privacy Policy.
                            </p>

                            <h2 className="text-2xl font-bold text-white mt-12 mb-4">6) Paid Plans, Billing, and Renewals</h2>
                            <p>Some features are offered as paid subscriptions (“Paid Plans”).</p>
                            <p>If you subscribe to a Paid Plan, you agree to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>pay the fees shown at checkout (plus applicable taxes), and</li>
                                <li>authorize us (or our payment processors) to charge your chosen payment method.</li>
                            </ul>
                            <p>We may support payments through PayPal, Visa, Mastercard, and other payment methods we make available.</p>
                            <h3 className="text-lg font-bold text-white mt-6 mb-2">Auto-renewal</h3>
                            <p>
                                If your subscription is auto-renewing, it will renew automatically unless you cancel before the renewal date. You authorize recurring charges at the interval disclosed at purchase.
                            </p>
                            <h3 className="text-lg font-bold text-white mt-6 mb-2">Price changes</h3>
                            <p>
                                We may change subscription prices. If a price increase applies to your subscription, we will provide notice and any required chance to accept before you are charged.
                            </p>
                            <h3 className="text-lg font-bold text-white mt-6 mb-2">Cancellation</h3>
                            <p>
                                You can cancel your subscription through your account settings (if available) or by contacting us at <a href="mailto:rewriteguard@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">rewriteguard@gmail.com</a>. Unless stated otherwise, you will keep access until the end of your current billing period and then your subscription will not renew.
                            </p>
                            <h3 className="text-lg font-bold text-white mt-6 mb-2">Refunds</h3>
                            <p>Fees are non-refundable except:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>as stated at the time of purchase,</li>
                                <li>if we decide to issue a refund at our discretion, or</li>
                                <li>where refunds are required by applicable law.</li>
                            </ul>
                            <p>If you purchased through a third party (for example, an app store), that third party’s billing and refund rules may apply.</p>

                            <h2 className="text-2xl font-bold text-white mt-12 mb-4">7) Third-Party Services</h2>
                            <p>
                                The Service may link to or integrate with third-party services (including payment providers and social media platforms). We do not control and are not responsible for third-party services. Your use of them is subject to their own terms and privacy policies.
                            </p>

                            <h2 className="text-2xl font-bold text-white mt-12 mb-4">8) Intellectual Property and Take-Down Requests</h2>
                            <p>You may not upload or share content that infringes intellectual property, privacy, publicity, or other rights.</p>
                            <p>If you believe content on the Service infringes your rights, email <a href="mailto:rewriteguard@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">rewriteguard@gmail.com</a> with:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>the material you want removed,</li>
                                <li>an explanation of your rights, and</li>
                                <li>why you believe the content is infringing.</li>
                            </ul>
                            <p>False or misleading infringement claims may result in liability under applicable law.</p>

                            <h2 className="text-2xl font-bold text-white mt-12 mb-4">9) Term and Termination</h2>
                            <p>These Terms remain in effect while you use the Service.</p>
                            <p>
                                We may suspend, restrict, or terminate your access (and/or terminate these Terms) if you violate these Terms, create risk or harm, or if required by law. Sections that by their nature should survive termination will survive.
                            </p>

                            <h2 className="text-2xl font-bold text-white mt-12 mb-4">10) Disclaimers</h2>
                            <p>
                                The Service is provided “as is” and “as available.” To the maximum extent permitted by law, we disclaim all warranties, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                            </p>
                            <p>We do not guarantee the Service will be uninterrupted, secure, or error-free, or that Output will meet your needs.</p>

                            <h2 className="text-2xl font-bold text-white mt-12 mb-4">11) Limitation of Liability</h2>
                            <p>To the maximum extent permitted by law:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>RewriteGuard is not liable for indirect, incidental, special, consequential, or punitive damages, or loss of profits, revenue, data, or goodwill.</li>
                                <li>Our total liability for any claim relating to the Service will not exceed the amount you paid to us for the Service in the 12 months before the event giving rise to the claim (or CAD $100 if you have not paid anything).</li>
                            </ul>
                            <p>Some jurisdictions do not allow certain limitations, so these limits may not apply to you in full.</p>

                            <h2 className="text-2xl font-bold text-white mt-12 mb-4">12) Indemnity</h2>
                            <p>You agree to defend, indemnify, and hold harmless RewriteGuard (<a href="https://www.p5solution.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">P5Solution</a>) from claims, damages, liabilities, and expenses (including reasonable legal fees) arising from:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>your use of the Service,</li>
                                <li>your Input or how you use Output, or</li>
                                <li>your violation of these Terms or applicable law.</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-white mt-12 mb-4">13) Governing Law and Disputes (Simple)</h2>
                            <p>These Terms are governed by the laws of British Columbia, Canada, without regard to conflict of law rules.</p>
                            <p>
                                You agree that any dispute relating to these Terms or the Service will be resolved in the courts located in British Columbia, Canada, unless mandatory consumer laws in your jurisdiction require a different approach.
                            </p>

                            <h2 className="text-2xl font-bold text-white mt-12 mb-4">14) Entire Agreement</h2>
                            <p>
                                These Terms, together with any policies linked on our website (including our Privacy Policy), form the entire agreement between you and RewriteGuard regarding your use of the Service.
                            </p>
                            <p>If any part of these Terms is found unenforceable, the rest remains in effect.</p>

                            <div className="text-center flex flex-col items-center pt-8 border-t border-white/10 mt-12 mb-8">
                                <h2 className="text-2xl font-bold text-white mb-4">15) Contact Us</h2>
                                <p className="mb-6">If you have questions about these Terms, contact us:</p>
                                <div className="bg-black/20 border border-white/5 p-6 md:p-8 rounded-2xl max-w-sm w-full mx-auto shadow-2xl">
                                    <p className="font-bold text-white text-xl mb-4">RewriteGuard (<a href="https://www.p5solution.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">P5Solution</a>)</p>
                                    <p className="text-gray-400 mb-2">North Vancouver, British Columbia, Canada</p>
                                    <p className="text-gray-300 mb-2"><span className="font-medium text-gray-400">Email:</span> <a href="mailto:rewriteguard@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">rewriteguard@gmail.com</a></p>
                                    <p className="text-gray-300"><span className="font-medium text-gray-400">Website:</span> <a href="https://www.rewriteguard.com" className="text-blue-400 hover:text-blue-300 transition-colors">https://www.rewriteguard.com/</a></p>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-white mt-12 mb-4">16) EEA/UK Notice (Consumer Rights)</h2>
                            <p>
                                If you are located in the EEA or UK, you may have mandatory consumer rights that cannot be waived by contract. Nothing in these Terms limits your non-waivable rights under applicable law.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Footer */}
            <Footer {...props} />
        </div>
    );
}
