import Footer from './components/Footer';
import LogoHomeButton from './components/LogoHomeButton';

export default function CookiesPolicy(props: any) {
    return (
        <div className="min-h-screen flex flex-col text-slate-700 dark:text-white bg-slate-50 dark:bg-[#0f172a]">
            <div className="flex-grow p-8 md:p-20">
                <div className="max-w-4xl mx-auto animate-fade-in-up">
                    <div className="mb-12">
                        <LogoHomeButton />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        RewriteGuard's Cookies Policy
                    </h1>

                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-gray-300 leading-relaxed">
                        <p className="text-lg text-slate-500 dark:text-gray-400 mb-8 font-medium">Effective February 25, 2026</p>

                        <p className="mb-6">
                            We are RewriteGuard, operated by <a href="https://www.p5solution.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">P5Solution</a>. This Cookies Policy describes the types of cookies and other tracking technologies we use, our purposes and basis for using them (where required by law), and your choices regarding them. If you have questions about this Cookies Policy, please see the Contact Us information on our website or contact us at <a href="mailto:rewritegaurd@p5solution.com" className="text-blue-400 hover:text-blue-300 transition-colors">rewritegaurd@p5solution.com</a>.
                        </p>

                        <p className="mb-2 font-semibold text-slate-900 dark:text-white">For purposes of this Cookies Policy:</p>
                        <ul className="list-disc pl-6 space-y-2 mb-6 text-slate-500 dark:text-gray-400">
                            <li><strong className="text-slate-900 dark:text-white">“RewriteGuard,” “we,” and “us”</strong> means <a href="https://www.p5solution.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">P5Solution</a> and its RewriteGuard-branded website and services.</li>
                            <li><strong className="text-slate-900 dark:text-white">“Services”</strong> means the services offered by us through <a href="https://www.rewriteguard.com/" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">https://www.rewriteguard.com/</a> and related tools, as described in our website terms and policies.</li>
                            <li><strong className="text-slate-900 dark:text-white">“First-party cookies”</strong> means cookies served directly by us to your computer or device.</li>
                            <li><strong className="text-slate-900 dark:text-white">“Third-party cookies”</strong> means cookies served by a third party on our behalf (for example, analytics or social media/marketing partners).</li>
                        </ul>

                        <p className="mb-12 text-slate-500 dark:text-gray-400">
                            Cookies can be “persistent” or “session” based. Persistent cookies remain on your device after your browser is closed. Session cookies are deleted automatically once your browser is closed.
                        </p>

                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-2xl mb-12 shadow-md">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 mt-0">TABLE OF CONTENTS</h2>
                            <ul className="space-y-2 text-blue-600 dark:text-blue-400 font-medium">
                                <li><a href="#background" className="hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Background</a></li>
                                <li><a href="#types-of-cookies" className="hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Types of Cookies</a></li>
                                <li><a href="#interest-based-ads" className="hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Information About Interest-Based Advertisements</a></li>
                                <li><a href="#manage-cookies" className="hover:text-blue-700 dark:hover:text-blue-300 transition-colors">How to Manage Cookies</a></li>
                                <li><a href="#dnt-signals" className="hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Do Not Track Signals</a></li>
                                <li><a href="#changes" className="hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Changes to this Cookie Policy</a></li>
                                <li><a href="#list-cookies" className="hover:text-blue-700 dark:hover:text-blue-300 transition-colors">List of Cookies, Purpose, and Storage Periods</a></li>
                            </ul>
                        </div>

                        <h2 id="background" className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">Background</h2>
                        <p className="mb-4">
                            RewriteGuard and our third-party providers—including those who provide website statistics on the use of our Services and those who provide marketing measurement services (including social media measurement)—use cookies and similar technologies such as pixel tags, web beacons, clear GIFs, SDKs and JavaScript (collectively, “Cookies”) for a variety of purposes.
                        </p>
                        <p>
                            For example, we use Cookies to enable our servers to recognize your web browser, tell us how and when you visit and use our Services (and, where applicable, whether you open an email from us), analyze trends, learn about our user base, and operate and improve our Services. Cookies are small pieces of data—usually text files—placed on your computer, tablet, phone or similar device when you use that device to access our Services. We may also supplement the information we collect from you with information received from third parties, including third parties that have placed their own Cookies on your device(s), where permitted by law.
                        </p>

                        <h2 id="types-of-cookies" className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">Types of Cookies</h2>
                        <p className="mb-6">Our Services use essential and one or more of the following optional Cookies (depending on your preferences):</p>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Essential Cookies</h3>
                                <p className="text-gray-400">Essential Cookies are required for providing you with features or services that you have requested and for operating our Services. For example, certain Cookies help with security, fraud prevention, network management, and access to core site functions (including secure areas, if applicable).</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Functional Cookies</h3>
                                <p className="text-gray-400">Functional Cookies are used to record your choices and settings regarding our Services, maintain your preferences over time, and recognize you when you return to our Services. These Cookies help us personalize your experience and remember your preferences (for example, your choice of language or region).</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Analytics Cookies</h3>
                                <p className="text-gray-400">Analytics Cookies allow us to understand how visitors use our Services. They do this by collecting information about the number of visitors to the Services, what pages visitors view on our Services, and how long visitors are viewing pages on the Services. Analytics Cookies also help us measure the performance of our marketing campaigns in order to help us improve our campaigns and the Services’ content for those who engage with our marketing.</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Advertising / Marketing Cookies</h3>
                                <p className="text-gray-400">Marketing Cookies collect data about your online activity and may be used to help us understand your interests so that we can show marketing that we believe is relevant to you on third-party platforms (for example, social media). Marketing Cookies may include retargeting Cookies. For more information, please see the Information About Interest-Based Advertisements section below.</p>
                            </div>
                        </div>

                        <h2 id="interest-based-ads" className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">Information About Interest-Based Advertisements</h2>
                        <p className="mb-4">
                            RewriteGuard does not display third-party ads on our website. However, we may work with third-party marketing and social media partners to promote RewriteGuard on other platforms. These partners may use Cookies or similar technologies to measure marketing performance, limit how often you see our marketing, build audiences, and (depending on your settings) show RewriteGuard marketing to people who have previously visited our Services (“Interest-Based Ads”).
                        </p>
                        <p className="mb-4">
                            Information used for Interest-Based Ads (which may include personal information, depending on applicable law and context) may be provided to us by you or derived from usage patterns of users on the Services and/or services of third parties. Such information may be gathered through tracking users’ activities across time and unaffiliated properties, including when you leave the Services.
                        </p>
                        <p>
                            To accomplish this, we or our service providers may deliver Cookies, including a file (known as a “web beacon” or pixel) through the Services. Web beacons allow partners to provide anonymized, aggregated auditing, research, and reporting for us and help measure marketing effectiveness. Web beacons may also enable partners to show RewriteGuard marketing to you when you visit other websites or platforms, depending on your preferences and settings.
                        </p>

                        <h2 id="manage-cookies" className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">How to Manage Cookies</h2>

                        <h3 className="text-xl font-semibold text-white mt-6 mb-2">Browser Settings</h3>
                        <p className="mb-4">You can decide whether to accept Cookies through your internet browser’s settings. Most browsers allow you to:</p>
                        <ul className="list-disc pl-6 space-y-2 mb-6 text-slate-500 dark:text-gray-400">
                            <li>block all Cookies,</li>
                            <li>block third-party Cookies only,</li>
                            <li>delete Cookies that are already on your device, and/or</li>
                            <li>choose how Cookies are handled site-by-site.</li>
                        </ul>
                        <p className="mb-4">If you disable or delete Cookies, you may have to manually adjust some preferences every time you visit our Services, and some features (such as logging in, saving settings, or security checks) may not work properly.</p>
                        <p className="mb-4">To explore what Cookie settings are available to you, look in the “Preferences,” “Options,” or “Settings” section of your browser’s menu.</p>
                        <p>To find out more about Cookies and how to manage or delete them, you can visit resources such as allaboutcookies.org (and for UK guidance, the ICO’s cookies information pages).</p>

                        <h3 className="text-xl font-semibold text-white mt-8 mb-2">Opting Out of Certain Analytics and Interest-Based Advertising</h3>
                        <p className="mb-4">Depending on how you use our Services and the tools we enable, we and our service providers may use analytics and advertising technologies that rely on Cookies or similar tracking tools.</p>

                        <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-white/10 mb-6 shadow-sm">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Analytics (measurement tools):</h4>
                            <p className="text-gray-400 mb-4">If we use analytics tools (such as Google Analytics or similar services), these tools may collect information about how visitors use our Services (for example, pages visited, time spent, and interactions) to help us understand usage trends and improve the Services. Where available, you may be able to opt out using provider controls (for example, browser add-ons or vendor opt-out pages).</p>

                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Advertising / Social media platforms (interest-based ads):</h4>
                            <p className="text-gray-400 mb-4">We may work with advertising partners (including social media platforms) to show ads that we think may interest you. These partners may use Cookies or similar technologies to collect information about your browsing behavior over time and across different websites/apps to deliver Interest-Based Ads.</p>
                            <p className="text-white font-medium mb-2">If you do not wish to receive personalized ads:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                <li>You can use opt-out tools offered by industry groups (such as the Network Advertising Initiative or the Digital Advertising Alliance) where available in your region.</li>
                                <li>You can also use any settings offered by your mobile operating system to limit ad tracking.</li>
                                <li>In many cases, you can adjust ad personalization settings directly within the relevant social media platform/account settings.</li>
                            </ul>
                        </div>

                        <h4 className="font-bold text-white mt-6 mb-2">Important notes about opting out</h4>
                        <ul className="list-disc pl-6 space-y-2 mb-8 text-gray-400">
                            <li>Even if you opt out of interest-based advertising, tracking technologies may still collect data for other purposes (such as security, fraud prevention, and analytics), and you may still see ads—but they may be less relevant.</li>
                            <li>Opt-outs are usually browser-specific and device-specific. If you use multiple browsers/devices, you may need to opt out on each one.</li>
                            <li>If you clear Cookies, you may need to set your opt-out preferences again.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mt-8 mb-2">Residents Outside the EEA, UK and Canada</h3>
                        <p className="mb-8">Where required or offered, you can manage optional Cookies using our cookie controls on the website (for example via Cookie Preferences), and you can also manage Cookies through your browser settings as described above.</p>

                        <h3 className="text-xl font-semibold text-white mt-8 mb-2">EEA, UK and Canada Residents</h3>
                        <p className="mb-4">If you are located in the EEA, the UK, or Canada, and you do not wish to accept non-Essential Cookies (or you wish to withdraw your consent), you can opt out or update your choices at any time by using our cookie controls:</p>
                        <p className="mb-8 pl-4 border-l-2 border-blue-500 text-white font-medium">Cookie Preferences (available on our website)</p>

                        <h2 id="dnt-signals" className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">Do Not Track Signals</h2>
                        <p className="mb-4">Your browser may offer a “Do Not Track” (DNT) option, which allows you to signal to operators of websites and web applications that you do not wish to be tracked across websites over time. Because of how Cookies and similar technologies work, our Services do not currently respond to Do Not Track signals.</p>
                        <p>To learn more about Do Not Track, you can visit allaboutdnt.com.</p>

                        <h2 id="changes" className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">Changes to this Cookie Policy</h2>
                        <p>We may update this Cookie Policy from time to time by posting the updated version on our website. Any changes will take effect on the “Effective” date posted at the top of the Cookie Policy. We encourage you to review it periodically to stay informed about how we use Cookies.</p>

                        <h2 id="list-cookies" className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">List of Cookies, Purpose, and Storage Periods</h2>
                        <h3 className="text-xl font-semibold text-white mt-6 mb-2">Essential Cookies</h3>
                        <p className="mb-6">Essential Cookies are required for providing you with features or services that you have requested. For example, certain Cookies enable you to log into secure areas of our Services, help with security and fraud prevention, and support core site functionality.</p>

                        <h3 className="text-xl font-semibold text-white mt-6 mb-2">Optional Cookies (if enabled)</h3>
                        <p className="mb-4">If you consent (or where permitted), we may also use one or more of the following optional categories:</p>
                        <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-400">
                            <li><strong>Functional Cookies</strong> (remembering preferences)</li>
                            <li><strong>Analytics Cookies</strong> (understanding usage and improving performance)</li>
                            <li><strong>Advertising Cookies</strong> (including interest-based advertising and retargeting)</li>
                        </ul>
                        <p className="mb-12">Where available, you can view and manage the specific Cookies used (including their purpose and duration) through Cookie Preferences on our website.</p>

                        <h2 id="contact" className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">Contact</h2>
                        <p className="mb-4">If you have questions about this Cookie Policy or our privacy practices, contact us at:</p>
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-2xl inline-block w-full md:w-auto shadow-lg">
                            <p className="font-bold text-slate-900 dark:text-white text-lg">RewriteGuard (<a href="https://www.p5solution.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">P5Solution</a>)</p>
                            <p className="mt-2 text-slate-600 dark:text-gray-300"><span className="font-medium text-slate-500 dark:text-gray-400">Email:</span> <a href="mailto:rewritegaurd@p5solution.com" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">rewritegaurd@p5solution.com</a></p>
                            <p className="mt-2 text-slate-600 dark:text-gray-300"><span className="font-medium text-slate-500 dark:text-gray-400">Location:</span> North Vancouver, British Columbia, Canada</p>
                            <p className="mt-2 text-slate-600 dark:text-gray-300"><span className="font-medium text-slate-500 dark:text-gray-400">Website:</span> <a href="https://www.rewriteguard.com/" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">https://www.rewriteguard.com/</a></p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer {...props} />
        </div>
    );
}
