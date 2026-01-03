import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
    return (
        <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-amber-500/30">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <Link to="/" className="inline-flex items-center gap-2 text-zinc-400 mb-8 hover:text-amber-400 transition-colors text-sm">
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <h1 className="text-3xl text-white font-bold mb-2">Terms of Service</h1>
                <p className="text-zinc-500 text-sm mb-8">Last Updated: January 2026</p>

                <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-sm leading-relaxed">
                    
                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">1. Acceptance of Terms</h2>
                        <p>By accessing or using Active Mirror ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.</p>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">2. Description of Service</h2>
                        <p>Active Mirror is an experimental artificial intelligence tool designed to facilitate personal reflection through questions. The Service operates in two modes:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li><strong className="text-white">Cloud Mode:</strong> User inputs are processed via third-party AI infrastructure (Groq API) to generate responses.</li>
                            <li><strong className="text-white">Sovereign Mode:</strong> AI processing occurs entirely within the user's browser using locally-downloaded models.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">3. Not Professional Advice</h2>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                            <p className="text-red-300 font-medium">THE SERVICE DOES NOT PROVIDE AND IS NOT A SUBSTITUTE FOR:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-1 text-red-200">
                                <li>Medical, health, or mental health advice</li>
                                <li>Legal advice or representation</li>
                                <li>Financial, investment, or tax advice</li>
                                <li>Therapeutic or counseling services</li>
                                <li>Any professional guidance requiring licensure</li>
                            </ul>
                        </div>
                        <p><strong className="text-white">YOU MUST NOT</strong> rely on any output from the Service for decisions affecting your health, legal rights, finances, safety, or wellbeing. Always consult qualified professionals for such matters.</p>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">4. Experimental Nature and Limitations</h2>
                        <p>You acknowledge and accept that:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li><strong className="text-white">AI Outputs May Be Wrong.</strong> The Service uses artificial intelligence that may generate inaccurate, misleading, incomplete, or fabricated information. Outputs should never be treated as factual.</li>
                            <li><strong className="text-white">No Verification.</strong> The Service cannot verify any information it generates. All outputs are unverified and should be independently confirmed.</li>
                            <li><strong className="text-white">No Understanding.</strong> The Service does not understand your situation, context, needs, or circumstances. It processes text patterns, not meaning.</li>
                            <li><strong className="text-white">Hallucination Is Expected.</strong> AI systems regularly produce false information presented as fact. This is a known limitation, not a defect.</li>
                            <li><strong className="text-white">No Memory.</strong> The Service does not remember previous sessions. Each conversation is independent.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">5. User Responsibility</h2>
                        <p><strong className="text-white">You are solely responsible for:</strong></p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Evaluating all outputs critically before any use</li>
                            <li>Verifying any information independently</li>
                            <li>Decisions made based on or after using the Service</li>
                            <li>Seeking appropriate professional help when needed</li>
                            <li>Your own mental health and wellbeing</li>
                            <li>Determining whether the Service is appropriate for your situation</li>
                        </ul>
                        <p className="mt-3"><strong className="text-white">The Service makes no decisions for you.</strong> All authority and responsibility remain with you.</p>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">6. Prohibited Uses</h2>
                        <p>You agree NOT to use the Service:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>As a substitute for emergency services or crisis intervention</li>
                            <li>For medical diagnosis, treatment decisions, or medication guidance</li>
                            <li>For legal strategy, advice, or document preparation</li>
                            <li>For financial decisions, investment choices, or tax planning</li>
                            <li>To obtain information intended to harm yourself or others</li>
                            <li>To generate content for fraud, deception, or manipulation</li>
                            <li>To attempt to extract factual information as if from a knowledge base</li>
                            <li>In any manner that violates applicable laws</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">7. Crisis Situations</h2>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                            <p className="text-amber-300 font-medium mb-3">THE SERVICE IS NOT EQUIPPED FOR CRISIS SITUATIONS.</p>
                            <p className="mb-3">If you are experiencing a mental health crisis, thoughts of self-harm, or any emergency, stop using this Service immediately and contact:</p>
                            <ul className="space-y-1 text-amber-200">
                                <li>• <strong>Emergency Services:</strong> 911 (US) or local emergency number</li>
                                <li>• <strong>Suicide Prevention:</strong> 988 (US)</li>
                                <li>• <strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">8. No Professional Relationship</h2>
                        <p>Use of the Service does not create any professional relationship including but not limited to:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Doctor-patient relationship</li>
                            <li>Attorney-client relationship</li>
                            <li>Therapist-client relationship</li>
                            <li>Fiduciary relationship</li>
                            <li>Advisory relationship</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">9. Assumption of Risk</h2>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                            <p className="text-red-300 font-medium mb-3">BY USING THIS SERVICE, YOU EXPRESSLY ACKNOWLEDGE AND ASSUME ALL RISKS ASSOCIATED WITH ITS USE, INCLUDING BUT NOT LIMITED TO:</p>
                            <ul className="list-disc pl-6 space-y-1 text-red-200">
                                <li>Risk of receiving inaccurate, misleading, or fabricated information</li>
                                <li>Risk of emotional distress from AI-generated content</li>
                                <li>Risk of making decisions based on AI outputs</li>
                                <li>Risk that the Service may not be appropriate for your mental or emotional state</li>
                                <li>Risk that AI responses may be unhelpful or inappropriate for your situation</li>
                            </ul>
                            <p className="mt-3 text-red-200">You agree that you are using this Service at your own risk and of your own free will.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">10. No Duty of Care</h2>
                        <p>The Service provider has <strong className="text-white">no duty of care</strong> to you. This means:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>We are not responsible for monitoring your wellbeing</li>
                            <li>We are not responsible for intervening in any situation</li>
                            <li>We are not responsible for the consequences of your use of the Service</li>
                            <li>We have no obligation to provide follow-up or continued support</li>
                            <li>We have no obligation to refer you to professional services</li>
                        </ul>
                        <p className="mt-3">The Service automatically displays crisis resources when certain keywords are detected, but this is a technical feature, not a duty of care. <strong className="text-white">You are solely responsible for seeking appropriate help.</strong></p>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">11. Intellectual Property</h2>
                        <p>The Service, including its design, code, and outputs, is owned by N1 Intelligence (OPC) Pvt Ltd. You may use outputs for personal purposes only. You may not:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Claim AI outputs as professional advice</li>
                            <li>Redistribute the Service or its components</li>
                            <li>Reverse engineer the Service</li>
                            <li>Use outputs for commercial purposes without permission</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">12. Disclaimer of Warranties</h2>
                        <p className="uppercase text-xs">THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO: MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY OR RELIABILITY OF OUTPUTS, NON-INFRINGEMENT, AVAILABILITY OR UPTIME.</p>
                        <p className="mt-2 uppercase text-xs">WE DO NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE, SECURE, OR UNINTERRUPTED.</p>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">13. Limitation of Liability</h2>
                        <p className="uppercase text-xs">TO THE MAXIMUM EXTENT PERMITTED BY LAW, N1 INTELLIGENCE (OPC) PVT LTD AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR: ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES; ANY LOSS OF PROFITS, DATA, USE, OR GOODWILL; ANY DAMAGES ARISING FROM YOUR USE OF OR RELIANCE ON THE SERVICE; ANY DECISIONS MADE BASED ON SERVICE OUTPUTS; ANY HARM RESULTING FROM AI INACCURACIES OR FABRICATIONS; ANY PHYSICAL, MENTAL, OR EMOTIONAL HARM TO YOU OR OTHERS; ANY SELF-HARM, SUICIDE, OR HARM TO THIRD PARTIES.</p>
                        <p className="mt-2 uppercase text-xs">THIS LIMITATION APPLIES REGARDLESS OF WHETHER WE WERE ADVISED OF THE POSSIBILITY OF SUCH DAMAGES AND REGARDLESS OF THE FORM OF ACTION.</p>
                        <p className="mt-2 uppercase text-xs">IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID TO USE THE SERVICE IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR $100 USD, WHICHEVER IS LESS.</p>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">14. Indemnification</h2>
                        <p>You agree to indemnify, defend, and hold harmless N1 Intelligence (OPC) Pvt Ltd and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, costs, and expenses (including attorneys' fees) arising from: your use of the Service; your violation of these Terms; your violation of any rights of another party; any decisions or actions taken based on Service outputs; any harm to yourself or others related to your use of the Service.</p>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">15. Governing Law</h2>
                        <p>These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of Goa, India. To the extent permitted by local law, you consent to this jurisdiction.</p>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">16. Changes to Terms</h2>
                        <p>We may modify these Terms at any time. Continued use after modifications constitutes acceptance. Material changes will be indicated by updating the "Last Updated" date.</p>
                    </section>

                    <section>
                        <h2 className="text-lg text-white font-semibold mb-3">17. Contact</h2>
                        <p>Questions about these Terms may be directed to: <a href="mailto:legal@n1intelligence.com" className="text-amber-400 hover:underline">legal@n1intelligence.com</a></p>
                    </section>

                </div>

                <div className="mt-12 pt-8 border-t border-zinc-800 text-xs text-zinc-600">
                    <p>© 2026 N1 Intelligence (OPC) Pvt Ltd. All rights reserved.</p>
                    <p className="mt-1">
                        <Link to="/privacy" className="hover:text-zinc-400">Privacy Policy</Link>
                        {' • '}
                        <Link to="/" className="hover:text-zinc-400">Home</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
