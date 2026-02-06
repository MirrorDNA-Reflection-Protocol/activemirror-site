/**
 * ⟡ PRICING PAGE — Coming Soon
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Shield, MessageCircle, Sparkles } from 'lucide-react';

const Pricing = () => {
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
          <div className="w-12" />
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

        {/* Coming Soon Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8 text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full mb-6">
            <Sparkles size={18} />
            <span className="text-sm font-medium">Coming Soon</span>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Pricing coming soon</h2>
          <p className="text-zinc-400 mb-8">
            Active Mirror is currently <span className="text-white font-medium">free during beta</span>.
            We're working on pricing plans that align with our mission of accessible reflection.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/mirror"
              className="inline-flex items-center justify-center gap-2 bg-white text-black font-medium px-6 py-3 rounded-xl hover:bg-zinc-200 transition"
            >
              <span className="text-lg">⟡</span>
              Try Free Now
            </Link>
            <button
              className="inline-flex items-center justify-center gap-2 bg-zinc-800 text-white font-medium px-6 py-3 rounded-xl hover:bg-zinc-700 transition cursor-not-allowed opacity-60"
              disabled
            >
              <Bell size={18} />
              Get Notified
            </button>
          </div>
        </motion.div>

        {/* What's Included Now */}
        <div className="max-w-xl mx-auto mb-16">
          <h3 className="text-lg font-semibold text-center mb-6 text-zinc-300">What's included during beta</h3>
          <ul className="space-y-4">
            {[
              { icon: MessageCircle, text: 'Unlimited reflections' },
              { icon: Shield, text: 'Protected by MirrorGate safety layer' },
              { icon: Sparkles, text: 'Access to AI Twins, Brief, and Cast' },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-zinc-300 bg-zinc-900/50 rounded-xl px-4 py-3">
                <item.icon size={18} className="text-purple-400" />
                {item.text}
              </li>
            ))}
          </ul>
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
                a: "Conversations are stored locally on your device only. We never sell or share your data."
              },
              {
                q: "What's the difference from ChatGPT?",
                a: "ChatGPT tries to answer your questions. Active Mirror asks better questions. It's designed for reflection and self-discovery, not information retrieval."
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
    </div>
  );
};

export default Pricing;
