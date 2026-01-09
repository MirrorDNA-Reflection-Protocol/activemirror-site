import React, { useState, useEffect } from 'react';

// Inline projects data - will be updated via API or manual refresh later
const INITIAL_PROJECTS = [
    {
        id: "mirrorgate",
        name: "MirrorGate",
        status: "active",
        priority: "P0",
        repo: "~/Documents/GitHub/MirrorGate/",
        remote: "github.com/MirrorDNA-Reflection-Protocol/MirrorGate",
        owner: "antigravity",
        next_action: "v2 cryptographic enforcement build",
        blockers: [],
        tags: ["infrastructure", "security", "core"]
    },
    {
        id: "mirrormesh",
        name: "MirrorMesh",
        status: "shipped",
        priority: "P1",
        repo: "~/Documents/GitHub/mirrormesh/",
        remote: "github.com/MirrorDNA-Reflection-Protocol/mirrormesh",
        owner: "antigravity",
        next_action: "Zenodo DOI + activemirror.ai page",
        blockers: [],
        tags: ["product", "governance"]
    },
    {
        id: "active_mirror",
        name: "Active Mirror",
        status: "shipped",
        priority: "P1",
        repo: "~/Documents/GitHub/activemirror-site/",
        remote: "activemirror.ai",
        owner: "paul",
        next_action: "Monitor production",
        blockers: [],
        tags: ["product", "web"]
    },
    {
        id: "mirrorbrain",
        name: "MirrorBrain",
        status: "active",
        priority: "P1",
        repo: "~/Documents/GitHub/MirrorBrain/",
        remote: "",
        owner: "paul",
        next_action: "Desktop app polish",
        blockers: [],
        tags: ["product", "desktop"]
    },
    {
        id: "truth_engine",
        name: "Truth Engine",
        status: "shipped",
        priority: "P2",
        repo: "~/Documents/GitHub/truth-scanner/",
        remote: "brief.activemirror.ai",
        owner: "paul",
        next_action: "Monitor and iterate",
        blockers: [],
        tags: ["product", "intelligence"]
    },
    {
        id: "infrastructure_tools",
        name: "Infrastructure Tools",
        status: "shipped",
        priority: "P2",
        repo: "~/.mirrordna/",
        remote: "",
        owner: "antigravity",
        next_action: "Documentation",
        blockers: [],
        tags: ["infrastructure", "tools"]
    }
];

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
        color: '#e5e7eb',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif",
        padding: '20px',
    },
    inner: {
        maxWidth: '1200px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    title: {
        fontSize: '1.8rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    glyph: {
        color: '#6366f1',
        fontSize: '1.5rem',
    },
    subtitle: {
        color: '#9ca3af',
        fontSize: '0.9rem',
        marginTop: '5px',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '15px',
        marginBottom: '40px',
    },
    statCard: {
        background: 'rgba(18, 18, 26, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '24px 20px',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        cursor: 'default',
    },
    statNumber: {
        fontSize: '2.5rem',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    statLabel: {
        color: '#9ca3af',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginTop: '8px',
    },
    sectionTitle: {
        fontSize: '1rem',
        fontWeight: 600,
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#e5e7eb',
    },
    projectsGrid: {
        display: 'grid',
        gap: '12px',
        marginBottom: '30px',
    },
    projectCard: {
        background: 'rgba(18, 18, 26, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '15px',
        alignItems: 'center',
        transition: 'all 0.2s ease',
    },
    projectName: {
        fontWeight: 600,
        fontSize: '1.05rem',
        marginBottom: '4px',
    },
    projectNext: {
        color: '#9ca3af',
        fontSize: '0.9rem',
    },
    badge: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.5px',
    },
    badgeP0: { background: '#ef4444' },
    badgeP1: { background: '#f59e0b', color: '#000' },
    badgeP2: { background: '#6366f1' },
    badgeP3: { background: '#4b5563' },
    ownerBadge: {
        fontSize: '0.75rem',
        padding: '4px 12px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '15px',
        color: '#9ca3af',
    },
    quickLinks: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginTop: '40px',
        paddingTop: '30px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
    },
    linkCard: {
        background: 'rgba(18, 18, 26, 0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '20px',
        textDecoration: 'none',
        color: '#e5e7eb',
        transition: 'all 0.2s ease',
        display: 'block',
    },
    linkTitle: {
        fontWeight: 600,
        marginBottom: '5px',
    },
    linkDesc: {
        fontSize: '0.85rem',
        color: '#9ca3af',
    },
};

export default function Hub() {
    const [projects, setProjects] = useState(INITIAL_PROJECTS);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const active = projects.filter(p => p.status === 'active');
    const shipped = projects.filter(p => p.status === 'shipped');
    const p0 = projects.filter(p => p.priority === 'P0');
    const blocked = projects.filter(p => p.blockers && p.blockers.length > 0);

    const getBadgeStyle = (priority) => {
        const base = { ...styles.badge };
        switch (priority) {
            case 'P0': return { ...base, ...styles.badgeP0 };
            case 'P1': return { ...base, ...styles.badgeP1 };
            case 'P2': return { ...base, ...styles.badgeP2 };
            default: return { ...base, ...styles.badgeP3 };
        }
    };

    const sortByPriority = (a, b) => {
        const order = { P0: 0, P1: 1, P2: 2, P3: 3 };
        return (order[a.priority] || 9) - (order[b.priority] || 9);
    };

    return (
        <div style={styles.container}>
            <div style={styles.inner}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.title}>
                            <span style={styles.glyph}>⟡</span>
                            Command Hub
                        </h1>
                        <p style={styles.subtitle}>N1 Intelligence • MirrorDNA Control Center</p>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                        {lastUpdated.toLocaleString()}
                    </div>
                </header>

                {/* Stats */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>{projects.length}</div>
                        <div style={styles.statLabel}>Total Projects</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>{active.length}</div>
                        <div style={styles.statLabel}>Active</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>{shipped.length}</div>
                        <div style={styles.statLabel}>Shipped</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>{p0.length}</div>
                        <div style={styles.statLabel}>P0 Critical</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>{blocked.length}</div>
                        <div style={styles.statLabel}>Blocked</div>
                    </div>
                </div>

                {/* Active Projects */}
                <h2 style={styles.sectionTitle}>🔄 Active Projects</h2>
                <div style={styles.projectsGrid}>
                    {active.sort(sortByPriority).map(p => (
                        <div key={p.id} style={styles.projectCard}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <span style={styles.projectName}>{p.name}</span>
                                    <span style={getBadgeStyle(p.priority)}>{p.priority}</span>
                                </div>
                                <div style={styles.projectNext}>→ {p.next_action}</div>
                            </div>
                            <span style={styles.ownerBadge}>{p.owner}</span>
                        </div>
                    ))}
                </div>

                {/* Shipped Projects */}
                <h2 style={styles.sectionTitle}>✅ Recently Shipped</h2>
                <div style={styles.projectsGrid}>
                    {shipped.sort(sortByPriority).slice(0, 4).map(p => (
                        <div key={p.id} style={{ ...styles.projectCard, opacity: 0.7 }}>
                            <div>
                                <span style={styles.projectName}>{p.name}</span>
                                <div style={{ ...styles.projectNext, marginTop: '4px' }}>
                                    {p.remote || p.repo}
                                </div>
                            </div>
                            <span style={styles.ownerBadge}>{p.owner}</span>
                        </div>
                    ))}
                </div>

                {/* Quick Links */}
                <div style={styles.quickLinks}>
                    <a href="/mirror" style={styles.linkCard}>
                        <div style={styles.linkTitle}>🪞 Mirror</div>
                        <div style={styles.linkDesc}>AI Interface • Cloud + Local</div>
                    </a>
                    <a href="https://brief.activemirror.ai" style={styles.linkCard} target="_blank" rel="noopener noreferrer">
                        <div style={styles.linkTitle}>📊 Truth Engine</div>
                        <div style={styles.linkDesc}>Daily Intelligence Brief</div>
                    </a>
                    <a href="https://docs.activemirror.ai" style={styles.linkCard} target="_blank" rel="noopener noreferrer">
                        <div style={styles.linkTitle}>📚 Docs</div>
                        <div style={styles.linkDesc}>MirrorDNA Documentation</div>
                    </a>
                    <a href="https://github.com/MirrorDNA-Reflection-Protocol" style={styles.linkCard} target="_blank" rel="noopener noreferrer">
                        <div style={styles.linkTitle}>⌨️ GitHub</div>
                        <div style={styles.linkDesc}>Open Source Repos</div>
                    </a>
                </div>

                <div style={{ marginTop: '40px', textAlign: 'center', color: '#6b7280', fontSize: '0.8rem' }}>
                    ⟡ MirrorDNA • N1 Intelligence • {new Date().getFullYear()}
                </div>
            </div>
        </div>
    );
}
