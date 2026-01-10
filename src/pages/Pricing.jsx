/**
 * ⟡ PRICING PAGE — Active Mirror Plans
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles, Shield, MessageCircle, History, Download, Zap, ArrowLeft } from 'lucide-react';
import { getUser, upgradeToPro, TIERS } from '../lib/auth';
import { redirectToCheckout, checkUpgradeSuccess, clearUpgradeParam, STRIPE_CONFIG } from '../lib/stripe';
import AuthModal from '../components/AuthModal';

const Pricing = () => {
  const [user, setUser] = useState(getUser());
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [justUpgraded, setJustUpgraded] = useState(false);

  // Check for successful upgrade on mount
  useEffect(() => {
    if (checkUpgradeSuccess()) {
      if (user) {
        const upgraded = upgradeToPro(user);
        setUser(upgraded);
        setJustUpgraded(true);
      }
      clearUpgradeParam();
    }
  }, []);

  const handleUpgrade = () => {
    if (!user) {
      setAuthMode('signin');
      setShowAuth(true);
      return;
    }
    
    // Check if Stripe is configured
    if (STRIPE_CONFIG.paymentLinkUrl.includes('YOUR_LINK')) {
      // Stripe not configured — upgrade directly for testing
      const upgraded = upgradeToPro(user);
      setUser(upgraded);
      setJustUpgraded(true);
    } else {
      // Stripe configured — redirect to checkout
      redirectToCheckout(user.email);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition">
            <ArrowLeft size={18} />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">⟡</span>
            <span className="font-semibold">Active Mirror</span>
          </div>
          {user ? (
            <span className="text-zinc-500 text-sm">{user.email}</span>
          ) : (
            <button
              onClick={() => { setAuthMode('signin'); setShowAuth(true); }}
              className="text-zinc-400 hover:text-white transition text-sm"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Think more clearly.
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Active Mirror asks the questions you need to hear. No advice. No judgment. Just reflection.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-semibold mb-2">Free</h2>
            <p className="text-zinc-400 mb-6">Try the mirror</p>
            
            <div className="mb-8">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-zinc-500">/month</span>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                { icon: MessageCircle, text: '5 reflections per day' },
                { icon: Shield, text: 'Protected by MirrorGate' },
                { icon: Check, text: 'No account required' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-300">
                  <item.icon size={18} className="text-zinc-500" />
                  {item.text}
                </li>
              ))}
            </ul>

            <Link
              to="/mirror"
              className="block w-full text-center bg-zinc-800 text-white font-medium py-3 rounded-xl hover:bg-zinc-700 transition"
            >
              Start Free
            </Link>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                RECOMMENDED
              </span>
            </div>

            <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
              Pro
              <Sparkles size={20} className="text-purple-400" />
            </h2>
            <p className="text-zinc-400 mb-6">Unlimited reflection</p>
            
            <div className="mb-8">
              <span className="text-4xl font-bold">${TIERS.PRO.price}</span>
              <span className="text-zinc-500">/month</span>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                { icon: Zap, text: 'Unlimited reflections', highlight: true },
                { icon: History, text: 'Conversation history' },
                { icon: Download, text: 'Export your insights' },
                { icon: Shield, text: 'Priority MirrorGate processing' },
                { icon: Sparkles, text: 'Early access to voice mode' },
              ].map((item, i) => (
                <li key={i} className={`flex items-center gap-3 ${item.highlight ? 'text-white' : 'text-zinc-300'}`}>
                  <item.icon size={18} className={item.highlight ? 'text-purple-400' : 'text-zinc-500'} />
                  {item.text}
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-3 rounded-xl hover:opacity-90 transition"
            >
              {user?.tier === 'PRO' ? 'Current Plan' : 'Upgrade to Pro'}
            </button>
          </motion.div>
        </div>

        {/* FAQ */}
        <div className="border-t border-zinc-800 pt-16">
          <h2 className="text-2xl font-semibold text-center mb-8">Questions</h2>
          
          <div className="space-y-6 max-w-2xl mx-auto">
            {[
              {
                q: "What is MirrorGate?",
                a: "MirrorGate is our AI safety layer. It prevents the AI from giving advice, making claims it can't verify, or behaving in ways that don't serve your reflection. Every response passes through 16 rules before reaching you."
              },
              {
                q: "Do you store my conversations?",
                a: "Free tier: Conversations are stored locally on your device only. Pro tier: Conversations can be synced across devices if you choose (coming soon). We never sell or share your data."
              },
              {
                q: "What's the difference from ChatGPT?",
                a: "ChatGPT tries to answer your questions. Active Mirror asks better questions. It's designed for reflection and self-discovery, not information retrieval."
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Cancel anytime from your account settings. No questions asked."
              },
            ].map((item, i) => (
              <div key={i}>
                <h3 className="text-white font-medium mb-2">{item.q}</h3>
                <p className="text-zinc-400">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16 pt-16 border-t border-zinc-800">
          <h2 className="text-2xl font-semibold mb-4">Ready to reflect?</h2>
          <Link
            to="/mirror"
            className="inline-flex items-center gap-2 bg-white text-black font-medium px-8 py-3 rounded-xl hover:bg-zinc-200 transition"
          >
            <span className="text-xl">⟡</span>
            Start Now
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8 mt-16">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-500 text-sm">
          <div>© 2026 N1 Intelligence. All rights reserved.</div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <Link to="/confessions" className="hover:text-white transition">Confessions</Link>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuth={setUser}
        mode={authMode}
        onUpgrade={() => {
          const upgraded = upgradeToPro(user);
          setUser(upgraded);
        }}
      />
    </div>
  );
};

export default Pricing;
