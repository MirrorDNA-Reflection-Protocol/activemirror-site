/**
 * ⟡ LANDING PAGE — Conversion-focused home
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Eye, MessageCircle, Check, Github, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⟡</span>
            <span className="font-semibold">Active Mirror</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/pricing" className="text-zinc-400 hover:text-white text-sm transition">Pricing</Link>
            <Link to="/confessions" className="text-zinc-400 hover:text-white text-sm transition">Confessions</Link>
            <a 
              href="https://github.com/MirrorDNA-Reflection-Protocol" 
              target="_blank"
              className="text-zinc-400 hover:text-white transition"
            >
              <Github size={18} />
            </a>
            <Link 
              to="/mirror"
              className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition"
            >
              Try Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Think more clearly.
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              AI that asks questions instead of giving answers.
              No advice. No manipulation. Just reflection.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                to="/mirror"
                className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-zinc-200 transition shadow-lg"
              >
                <span className="text-xl">⟡</span>
                Start Reflecting
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/confessions"
                className="flex items-center gap-2 text-zinc-400 px-8 py-4 rounded-xl border border-zinc-700 hover:border-zinc-500 hover:text-white transition"
              >
                <Eye size={18} />
                Watch the Confessions
              </Link>
            </div>
            <p className="text-sm text-zinc-600">
              5 free reflections per day. No account required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What makes it different */}
      <section className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Not another chatbot.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: "Questions, not answers",
                description: "Active Mirror helps you think by asking the questions you need to hear. It never tells you what to do."
              },
              {
                icon: Shield,
                title: "Protected by MirrorGate",
                description: "Every response passes through 16 rules. Blocked outputs are logged. The AI can't lie without consequences."
              },
              {
                icon: Eye,
                title: "Visible gears",
                description: "See exactly what the AI tried to say but couldn't. Total transparency. No hidden agenda."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              >
                <item.icon className="text-purple-400 mb-4" size={28} />
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-zinc-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Confession Booth CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Watch the AI confess.
            </h2>
            <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
              We built a live feed of everything the AI tried to say but got blocked.
              Every rule triggered. Every temptation resisted. In real-time.
            </p>
            <Link
              to="/confessions"
              className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-8 py-4 rounded-xl font-semibold border border-red-500/30 hover:bg-red-500/30 transition"
            >
              <Eye size={18} />
              activemirror.ai/confessions
              <ExternalLink size={14} />
            </Link>
            <p className="text-sm text-zinc-600 mt-4">
              No one else shows you this.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            How it works
          </h2>
          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "You share what's on your mind",
                description: "A decision you're facing, a feeling you're processing, a situation you're navigating."
              },
              {
                step: "2",
                title: "The Mirror asks questions",
                description: "Not advice. Not opinions. Questions that help you see your own thoughts more clearly."
              },
              {
                step: "3",
                title: "MirrorGate watches everything",
                description: "If the AI tries to claim authority, give unsolicited advice, or cite fake sources — it gets blocked."
              },
              {
                step: "4",
                title: "You think for yourself",
                description: "The goal isn't to give you answers. It's to help you find your own."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-6"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-300 font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-zinc-400">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple pricing</h2>
          <p className="text-zinc-400 mb-12">Start free. Upgrade when you need more.</p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-left">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <div className="text-3xl font-bold mb-4">$0</div>
              <ul className="space-y-2 text-zinc-400">
                <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> 5 reflections/day</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> MirrorGate protection</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-green-400" /> No account needed</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6 text-left">
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-4">$10<span className="text-lg font-normal text-zinc-400">/mo</span></div>
              <ul className="space-y-2 text-zinc-300">
                <li className="flex items-center gap-2"><Check size={16} className="text-purple-400" /> Unlimited reflections</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-purple-400" /> Conversation history</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-purple-400" /> Export insights</li>
              </ul>
            </div>
          </div>
          
          <Link 
            to="/pricing" 
            className="inline-block mt-8 text-zinc-400 hover:text-white transition"
          >
            Compare plans →
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to reflect?</h2>
          <p className="text-zinc-400 mb-8">
            No signup required. Your first 5 reflections are free.
          </p>
          <Link
            to="/mirror"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-zinc-200 transition shadow-lg text-lg"
          >
            <span className="text-xl">⟡</span>
            Start Now
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-zinc-500">
            <span className="text-xl">⟡</span>
            <span>Active Mirror by N1 Intelligence</span>
          </div>
          <div className="flex gap-6 text-zinc-500">
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <a href="https://github.com/MirrorDNA-Reflection-Protocol" className="hover:text-white transition">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
