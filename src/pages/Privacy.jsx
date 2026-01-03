import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-amber-500/30">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <Link to="/" className="inline-flex items-center gap-2 text-zinc-400 mb-8 hover:text-amber-400 transition-colors text-sm">
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <h1 className="text-3xl text-white font-bold mb-2">Privacy Policy</h1>
                <p className="text-zinc-500 text-sm mb-8">Last Updated: January 2026</p>

                <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-sm leading-relaxed">
                    
                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">1. Introduction</h2>
                        <p>This Privacy Policy explains how Active Mirror ("Service"), operated by N1 Intelligence (OPC) Pvt Ltd ("we", "us", "our"), handles information. We are committed to transparency about what we do and do not collect.</p>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">2. Our Privacy Commitment</h2>
                        <p>Active Mirror is designed with privacy as a foundational principle:</p>
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-3">
                            <ul className="space-y-2 text-green-200">
                                <li>• <strong className="text-green-300">Sovereign Mode:</strong> All processing happens locally in your browser. We receive nothing.</li>
                                <li>• <strong className="text-green-300">Cloud Mode:</strong> Messages are processed via Groq API and are not stored by us after response generation.</li>
                                <li>• <strong className="text-green-300">No Accounts:</strong> We do not require registration or login.</li>
                                <li>• <strong className="text-green-300">No Tracking:</strong> We do not track you across sessions or devices.</li>
                                <li>• <strong className="text-green-300">No Profiling:</strong> We do not build profiles of users.</li>
                                <li>• <strong className="text-green-300">No Selling:</strong> We do not sell any data to anyone.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">3. Information We Do NOT Collect</h2>
                        <p>We explicitly <strong className="text-white">do not collect:</strong></p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Your name, email, or contact information</li>
                            <li>Your conversation content (in Sovereign Mode)</li>
                            <li>Your IP address for tracking purposes</li>
                            <li>Device fingerprints for identification</li>
                            <li>Behavioral data for profiling</li>
                            <li>Location data</li>
                            <li>Browsing history</li>
                            <li>Any information from your device beyond what is needed to render the webpage</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">4. Sovereign Mode — Complete Local Processing</h2>
                        <p>When you use Sovereign Mode:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>AI models are downloaded once to your browser's cache</li>
                            <li>All inference happens locally on your device</li>
                            <li>Your inputs never leave your device</li>
                            <li>Your outputs never leave your device</li>
                            <li>We have no visibility into your usage</li>
                            <li>We cannot access your conversations</li>
                        </ul>
                        <div className="bg-zinc-800/50 rounded-lg p-4 mt-3">
                            <p className="text-zinc-400 text-xs"><strong className="text-zinc-300">Your browser may store:</strong> AI model files (approximately 900MB) in browser cache. This data remains on your device and under your control. You can clear this anytime via browser settings → Clear site data.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">5. Cloud Mode — Third-Party Processing</h2>
                        <p>When you use Cloud Mode:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Your input is sent to our safety proxy server</li>
                            <li>The proxy routes requests to Groq API (<a href="https://groq.com" className="text-amber-400 hover:underline" target="_blank" rel="noopener noreferrer">groq.com</a>) for processing</li>
                            <li>We do not store your inputs or outputs</li>
                            <li>We do not log conversation content</li>
                        </ul>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-3">
                            <p className="text-amber-200 text-xs"><strong className="text-amber-300">Groq's data handling:</strong> Groq may process your data according to their privacy policy. Groq's servers are located in the United States. We encourage you to review Groq's privacy policy at <a href="https://groq.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">groq.com/privacy</a></p>
                        </div>
                        <p className="mt-3"><strong className="text-white">What we transmit to Groq:</strong></p>
                        <ul className="list-disc pl-6 mt-1 space-y-1">
                            <li>Your message text</li>
                            <li>System instructions (identical for all users)</li>
                            <li>No identifying information about you</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">6. Technical Data</h2>
                        <p>We may collect minimal technical data for service operation:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Aggregate, anonymized usage statistics (e.g., total page views)</li>
                            <li>Error logs that do not contain conversation content</li>
                            <li>Performance metrics that do not identify individuals</li>
                        </ul>
                        <p className="mt-2">This data cannot be linked to any individual user.</p>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">7. Cookies and Local Storage</h2>
                        <p><strong className="text-white">Cookies:</strong> We do not use cookies for tracking. We may use essential cookies for basic site functionality only.</p>
                        <p className="mt-2"><strong className="text-white">Local Storage:</strong> Sovereign Mode stores AI models in your browser's IndexedDB/Cache API. This is entirely local to your device.</p>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">8. Third-Party Services</h2>
                        <p>The Service may use:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li><strong className="text-white">Groq API</strong> (Cloud Mode only) — AI inference</li>
                            <li><strong className="text-white">GitHub Pages</strong> — Website hosting</li>
                            <li><strong className="text-white">Cloudflare</strong> — DNS and tunnel services</li>
                            <li><strong className="text-white">jsDelivr CDN</strong> — JavaScript library delivery</li>
                        </ul>
                        <p className="mt-2">These services have their own privacy policies. We do not share personal information with these services beyond what is technically necessary for operation.</p>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">9. Data Retention</h2>
                        <ul className="list-disc pl-6 space-y-1">
                            <li><strong className="text-white">Sovereign Mode:</strong> We retain nothing. Data exists only on your device.</li>
                            <li><strong className="text-white">Cloud Mode:</strong> We do not retain conversation data. Groq's retention is governed by their policies.</li>
                            <li><strong className="text-white">Technical Logs:</strong> Retained for up to 30 days, contain no personal information.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">10. Your Rights and Controls</h2>
                        <p><strong className="text-white">You have the right to:</strong></p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Use Sovereign Mode for complete privacy</li>
                            <li>Clear browser data to remove all local storage</li>
                            <li>Stop using the Service at any time</li>
                            <li>Request information about what we store (answer: nothing identifiable)</li>
                        </ul>
                        
                        <div className="bg-zinc-800/50 rounded-lg p-4 mt-4">
                            <p className="text-zinc-300 font-medium mb-2">GDPR Rights (EU Users):</p>
                            <ul className="text-zinc-400 text-xs space-y-1">
                                <li>• Right to access: We store no personal data to access</li>
                                <li>• Right to rectification: We store no personal data to rectify</li>
                                <li>• Right to erasure: Clear your browser data; we store nothing server-side</li>
                                <li>• Right to portability: No data exists to port</li>
                                <li>• Right to object: Stop using the Service</li>
                            </ul>
                        </div>

                        <div className="bg-zinc-800/50 rounded-lg p-4 mt-3">
                            <p className="text-zinc-300 font-medium mb-2">CCPA Rights (California Users):</p>
                            <ul className="text-zinc-400 text-xs space-y-1">
                                <li>• Right to know: This policy discloses all practices</li>
                                <li>• Right to delete: We store no personal information</li>
                                <li>• Right to opt-out of sale: We do not sell data</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">11. Children's Privacy</h2>
                        <p>The Service is not intended for children under 13. We do not knowingly collect information from children. If you believe a child has used the Service, note that we collect no identifiable information regardless of user age.</p>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">12. International Users</h2>
                        <p>The Service is operated from India. If you access from other jurisdictions:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li><strong className="text-white">Cloud Mode:</strong> Data is processed in the United States via Groq</li>
                            <li><strong className="text-white">Sovereign Mode:</strong> Data never leaves your local device</li>
                        </ul>
                        <p className="mt-2">By using Cloud Mode, you consent to processing in the United States.</p>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">13. Security</h2>
                        <p>We implement reasonable security measures:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>HTTPS encryption for all communications</li>
                            <li>No storage of sensitive data server-side</li>
                            <li>No authentication systems that could be compromised</li>
                            <li>Local-first architecture minimizes attack surface</li>
                        </ul>
                        <p className="mt-2">However, no system is perfectly secure. Use Sovereign Mode for maximum privacy.</p>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">14. Changes to This Policy</h2>
                        <p>We may update this policy. Changes will be indicated by updating the "Last Updated" date. Continued use constitutes acceptance.</p>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">15. Contact</h2>
                        <p>Privacy inquiries: <a href="mailto:privacy@n1intelligence.com" className="text-amber-400 hover:underline">privacy@n1intelligence.com</a></p>
                        <p className="mt-1">Data Protection Contact: N1 Intelligence (OPC) Pvt Ltd, Goa, India</p>
                    </section>

                </div>

                <div className="mt-12 pt-8 border-t border-zinc-800 text-xs text-zinc-600">
                    <p>© 2026 N1 Intelligence (OPC) Pvt Ltd. All rights reserved.</p>
                    <p className="mt-1">
                        <Link to="/terms" className="hover:text-zinc-400">Terms of Service</Link>
                        {' • '}
                        <Link to="/" className="hover:text-zinc-400">Home</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
