/**
 * ⟡ Skills Page — Showcase the MirrorDNA Skill System
 * Commands that extend AI capabilities with sovereign infrastructure
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal, GitCommit, Rocket, FileText, Activity, Clock,
    Search, History, Shield, Database, Zap, Send, Brain,
    RefreshCw, Archive, AlertTriangle, Globe, Book,
    Layers, Eye, Target, MessageSquare, ArrowRight, Github,
    CheckCircle, ChevronDown, ChevronRight
} from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { useTheme } from '../contexts/ThemeContext';

const skillCategories = [
    {
        id: 'workflow',
        name: 'Workflow',
        description: 'Daily operations and development flow',
        color: 'purple',
        skills: [
            { name: '/commit', desc: 'Smart commit with auto-generated messages', icon: GitCommit, example: '/commit "fix auth bug"' },
            { name: '/ship', desc: 'Commit, push, and deploy in one command', icon: Rocket, example: '/ship' },
            { name: '/deploy', desc: 'Deploy to production with verification', icon: Globe, example: '/deploy site' },
            { name: '/pr', desc: 'Create pull request with context', icon: GitCommit, example: '/pr "Add new feature"' },
            { name: '/review', desc: 'Review code changes with AI analysis', icon: Eye, example: '/review PR-123' },
            { name: '/release', desc: 'Tag and release with changelog', icon: Rocket, example: '/release v1.2.0' },
        ]
    },
    {
        id: 'intelligence',
        name: 'Intelligence',
        description: 'AI-powered insights and analysis',
        color: 'cyan',
        skills: [
            { name: '/brief', desc: 'Generate sovereign briefing from news', icon: FileText, example: '/brief' },
            { name: '/research', desc: 'Deep research on any topic', icon: Search, example: '/research "quantum computing"' },
            { name: '/reflect', desc: 'Reflective journaling session', icon: Brain, example: '/reflect' },
            { name: '/draft', desc: 'Draft content with AI assistance', icon: MessageSquare, example: '/draft blog post' },
            { name: '/focus', desc: 'Enter deep focus mode', icon: Target, example: '/focus 2h' },
        ]
    },
    {
        id: 'state',
        name: 'State & Memory',
        description: 'Persistent context across sessions',
        color: 'emerald',
        skills: [
            { name: '/bus', desc: 'Read/write to the Memory Bus', icon: Database, example: '/bus read' },
            { name: '/handoff', desc: 'Create session handoff document', icon: Send, example: '/handoff' },
            { name: '/pickup', desc: 'Resume from previous handoff', icon: RefreshCw, example: '/pickup' },
            { name: '/history', desc: 'View session history', icon: History, example: '/history 7d' },
            { name: '/note', desc: 'Quick note to persistent memory', icon: FileText, example: '/note "Remember this"' },
        ]
    },
    {
        id: 'infrastructure',
        name: 'Infrastructure',
        description: 'System health and maintenance',
        color: 'amber',
        skills: [
            { name: '/health', desc: 'Check system health across services', icon: Activity, example: '/health' },
            { name: '/services', desc: 'Manage LaunchAgents and daemons', icon: Layers, example: '/services status' },
            { name: '/logs', desc: 'View and analyze logs', icon: Terminal, example: '/logs mirror-api' },
            { name: '/backup', desc: 'Backup critical data', icon: Archive, example: '/backup vault' },
            { name: '/emergency', desc: 'Emergency recovery procedures', icon: AlertTriangle, example: '/emergency' },
        ]
    },
    {
        id: 'vault',
        name: 'Vault & Knowledge',
        description: 'Knowledge management and organization',
        color: 'pink',
        skills: [
            { name: '/find', desc: 'Search across vault and repos', icon: Search, example: '/find "MirrorGate"' },
            { name: '/read', desc: 'Read and summarize documents', icon: Book, example: '/read spec.md' },
            { name: '/compress', desc: 'Compress verbose docs', icon: Archive, example: '/compress notes/' },
            { name: '/glossary', desc: 'Look up MirrorDNA terms', icon: Book, example: '/glossary "glyph"' },
            { name: '/link', desc: 'Create vault cross-references', icon: Layers, example: '/link doc1 doc2' },
        ]
    },
    {
        id: 'operations',
        name: 'Operations',
        description: 'Scheduled tasks and maintenance',
        color: 'blue',
        skills: [
            { name: '/standup', desc: 'Morning standup summary', icon: Clock, example: '/standup' },
            { name: '/overnight', desc: 'Overnight task queue', icon: Clock, example: '/overnight' },
            { name: '/audit', desc: 'Run security/compliance audit', icon: Shield, example: '/audit' },
            { name: '/decay', desc: 'Clean stale files and tasks', icon: RefreshCw, example: '/decay 30d' },
            { name: '/changelog', desc: 'Generate changelog from commits', icon: FileText, example: '/changelog v1.1..v1.2' },
        ]
    },
];

const colorMap = {
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', gradient: 'from-purple-500 to-violet-500' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', gradient: 'from-cyan-500 to-blue-500' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', gradient: 'from-emerald-500 to-green-500' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', gradient: 'from-amber-500 to-yellow-500' },
    pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400', gradient: 'from-pink-500 to-rose-500' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', gradient: 'from-blue-500 to-indigo-500' },
};

function SkillCard({ skill, color, isDark }) {
    const Icon = skill.icon;
    const colors = colorMap[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                isDark
                    ? `${colors.bg} ${colors.border} hover:border-opacity-50`
                    : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-md'
            }`}
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon size={18} className={colors.text} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <code className={`font-mono font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {skill.name}
                        </code>
                    </div>
                    <p className={`text-sm mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {skill.desc}
                    </p>
                    <code className={`text-xs px-2 py-1 rounded ${
                        isDark ? 'bg-black/30 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                        {skill.example}
                    </code>
                </div>
            </div>
        </motion.div>
    );
}

function CategorySection({ category, isDark, isExpanded, onToggle }) {
    const colors = colorMap[category.color];

    return (
        <div className="mb-8">
            <button
                onClick={onToggle}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    isDark
                        ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                        : 'bg-white hover:bg-zinc-50 border border-zinc-200'
                }`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors.gradient}`} />
                    <div className="text-left">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {category.name}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            {category.description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {category.skills.length} skills
                    </span>
                    {isExpanded ? (
                        <ChevronDown size={20} className={isDark ? 'text-zinc-400' : 'text-zinc-500'} />
                    ) : (
                        <ChevronRight size={20} className={isDark ? 'text-zinc-400' : 'text-zinc-500'} />
                    )}
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                            {category.skills.map((skill, i) => (
                                <SkillCard
                                    key={skill.name}
                                    skill={skill}
                                    color={category.color}
                                    isDark={isDark}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function Skills() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [expandedCategories, setExpandedCategories] = useState(
        skillCategories.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {})
    );

    const toggleCategory = (id) => {
        setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const totalSkills = skillCategories.reduce((sum, cat) => sum + cat.skills.length, 0);

    return (
        <PageLayout>
            {/* Hero */}
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                            <Terminal size={32} className="text-purple-400" />
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}
                    >
                        Skill System
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`text-lg max-w-2xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
                    >
                        {totalSkills} commands that extend AI capabilities. From smart commits to sovereign briefings —
                        all powered by the MirrorDNA protocol.
                    </motion.p>

                    {/* Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap gap-4 mb-8"
                    >
                        <div className={`px-4 py-2 rounded-xl ${
                            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-zinc-200'
                        }`}>
                            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                {totalSkills}
                            </span>
                            <span className={`text-sm ml-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                Skills
                            </span>
                        </div>
                        <div className={`px-4 py-2 rounded-xl ${
                            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-zinc-200'
                        }`}>
                            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                {skillCategories.length}
                            </span>
                            <span className={`text-sm ml-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                Categories
                            </span>
                        </div>
                        <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                            isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
                        }`}>
                            <CheckCircle size={18} className="text-emerald-500" />
                            <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                All Active
                            </span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* How It Works */}
            <section className={`py-12 px-4 sm:px-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        How Skills Work
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-6">
                        <div className={`p-5 rounded-xl ${
                            isDark ? 'bg-zinc-900/50 border border-white/10' : 'bg-white border border-zinc-200'
                        }`}>
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                                <Terminal size={20} className="text-purple-400" />
                            </div>
                            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                Invoke
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                Type the skill command in any Claude Code session. Example: <code>/commit</code>
                            </p>
                        </div>
                        <div className={`p-5 rounded-xl ${
                            isDark ? 'bg-zinc-900/50 border border-white/10' : 'bg-white border border-zinc-200'
                        }`}>
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-3">
                                <Zap size={20} className="text-cyan-400" />
                            </div>
                            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                Execute
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                The skill loads context from the Memory Bus and executes with full system access.
                            </p>
                        </div>
                        <div className={`p-5 rounded-xl ${
                            isDark ? 'bg-zinc-900/50 border border-white/10' : 'bg-white border border-zinc-200'
                        }`}>
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3">
                                <Database size={20} className="text-emerald-400" />
                            </div>
                            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                Persist
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                Results are logged to the bus. Your AI maintains context across sessions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Skills by Category */}
            <section className="py-12 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    {skillCategories.map((category) => (
                        <CategorySection
                            key={category.id}
                            category={category}
                            isDark={isDark}
                            isExpanded={expandedCategories[category.id]}
                            onToggle={() => toggleCategory(category.id)}
                        />
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 sm:px-6">
                <div className={`max-w-3xl mx-auto text-center p-8 rounded-2xl ${
                    isDark
                        ? 'bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20'
                        : 'bg-gradient-to-br from-purple-50 to-cyan-50 border border-purple-200'
                }`}>
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Build Your Own Skills
                    </h2>
                    <p className={`mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Skills are markdown files in <code>~/.claude/commands/</code>. Create custom workflows for your needs.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="https://github.com/MirrorDNA-Reflection-Protocol"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
                        >
                            <Github size={18} />
                            View on GitHub
                        </a>
                        <Link
                            to="/docs"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                                isDark
                                    ? 'bg-white/10 hover:bg-white/20 text-white'
                                    : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900'
                            }`}
                        >
                            <Book size={18} />
                            Read Docs
                        </Link>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}
