import React, { useState, useEffect, useMemo } from 'react';

// =============================================================================
// DATA
// =============================================================================

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
    },
    {
        id: "orchestrator_model",
        name: "Orchestrator Model",
        status: "shipped",
        priority: "P2",
        repo: "~/MirrorDNA-Vault/00_CANONICAL/",
        remote: "",
        owner: "antigravity",
        next_action: "Publish externally",
        blockers: [],
        tags: ["documentation", "protocol"]
    }
];

const SAMPLE_TASKS = [
    { id: 1, title: "MirrorGate v2 cryptographic enforcement", priority: "P0", project: "MirrorGate", type: "build" },
    { id: 2, title: "Create Zenodo DOI for MirrorMesh", priority: "P1", project: "MirrorMesh", type: "task" },
    { id: 3, title: "Desktop app UI polish", priority: "P1", project: "MirrorBrain", type: "task" },
    { id: 4, title: "Update docs with new tools", priority: "P2", project: "MirrorDNA Docs", type: "task" },
];

const SAMPLE_NOTIFICATIONS = [
    { id: 1, type: "success", message: "MirrorMesh pushed to GitHub", time: "5m ago" },
    { id: 2, type: "info", message: "Hub deployed to activemirror.ai", time: "10m ago" },
    { id: 3, type: "success", message: "10 Infrastructure tasks complete", time: "30m ago" },
];

const SAMPLE_METRICS = {
    commits_today: 12,
    open_prs: 0,
    deployments: 3,
    agents_active: 2,
};

const SAMPLE_EVENTS = [
    { date: "2026-01-09", title: "MirrorGate v2 target", type: "deadline" },
    { date: "2026-01-10", title: "MirrorMesh DOI publish", type: "task" },
    { date: "2026-01-12", title: "Weekly review", type: "meeting" },
];

const SEARCHABLE_ITEMS = [
    { type: "project", name: "MirrorGate", path: "/hub", icon: "📁" },
    { type: "project", name: "MirrorMesh", path: "https://github.com/MirrorDNA-Reflection-Protocol/mirrormesh", icon: "📁" },
    { type: "project", name: "MirrorBrain", path: "/hub", icon: "📁" },
    { type: "doc", name: "Orchestrator Model v1.0", path: "obsidian://open?vault=MirrorDNA-Vault&file=00_CANONICAL/Orchestrator_Model_v1.0", icon: "📄" },
    { type: "doc", name: "Master Citation v15.4", path: "obsidian://open?vault=MirrorDNA-Vault&file=00_CANONICAL/Master_Citation_v15.4", icon: "📄" },
    { type: "doc", name: "Ecosystem Map", path: "obsidian://open?vault=MirrorDNA-Vault&file=00_CANONICAL/Ecosystem_Map_v1.0", icon: "📄" },
    { type: "page", name: "Mirror AI", path: "/mirror", icon: "🪞" },
    { type: "page", name: "Truth Engine", path: "https://brief.activemirror.ai", icon: "📊" },
    { type: "page", name: "Documentation", path: "https://docs.activemirror.ai", icon: "📚" },
    { type: "tool", name: "Project Tracker", path: "obsidian://open?vault=MirrorDNA-Vault&file=01_ACTIVE/PROJECT_TRACKER", icon: "📋" },
    { type: "tool", name: "Fleet Dashboard", path: "/hub", icon: "📡" },
    { type: "tool", name: "Cost Tracker", path: "/hub", icon: "💰" },
];

// =============================================================================
// STYLES
// =============================================================================

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
        color: '#e5e7eb',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif",
        padding: '20px',
    },
    inner: {
        maxWidth: '1400px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        flexWrap: 'wrap',
        gap: '15px',
    },
    title: {
        fontSize: '1.6rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    glyph: {
        color: '#6366f1',
    },
    searchContainer: {
        position: 'relative',
        flex: '1',
        maxWidth: '400px',
        minWidth: '250px',
    },
    searchInput: {
        width: '100%',
        padding: '12px 16px 12px 42px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        color: '#e5e7eb',
        fontSize: '0.9rem',
        outline: 'none',
        transition: 'all 0.2s',
    },
    searchIcon: {
        position: 'absolute',
        left: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#6b7280',
        pointerEvents: 'none',
    },
    searchResults: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        background: '#1a1a25',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        marginTop: '5px',
        maxHeight: '300px',
        overflow: 'auto',
        zIndex: 100,
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    },
    searchResult: {
        padding: '12px 16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        transition: 'background 0.15s',
    },
    mainGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '20px',
    },
    leftColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    rightColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    card: {
        background: 'rgba(18, 18, 26, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '20px',
    },
    cardTitle: {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px',
        marginBottom: '20px',
    },
    statCard: {
        background: 'rgba(18, 18, 26, 0.8)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '18px 14px',
        textAlign: 'center',
        transition: 'all 0.2s',
    },
    statNumber: {
        fontSize: '2rem',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    statLabel: {
        color: '#6b7280',
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginTop: '5px',
    },
    projectCard: {
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        padding: '14px 16px',
        marginBottom: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'all 0.15s',
    },
    badge: {
        padding: '3px 10px',
        borderRadius: '15px',
        fontSize: '0.65rem',
        fontWeight: 700,
    },
    quickActionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
    },
    quickAction: {
        background: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '10px',
        padding: '14px 12px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '0.8rem',
    },
    notification: {
        padding: '10px 12px',
        borderRadius: '8px',
        marginBottom: '8px',
        fontSize: '0.85rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    notificationSuccess: {
        background: 'rgba(16, 185, 129, 0.1)',
        borderLeft: '3px solid #10b981',
    },
    notificationInfo: {
        background: 'rgba(99, 102, 241, 0.1)',
        borderLeft: '3px solid #6366f1',
    },
    notificationWarning: {
        background: 'rgba(245, 158, 11, 0.1)',
        borderLeft: '3px solid #f59e0b',
    },
    eventItem: {
        padding: '10px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metricRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        fontSize: '0.9rem',
    },
    integrationLinks: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
    },
    integrationLink: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '8px',
        padding: '12px',
        textDecoration: 'none',
        color: '#e5e7eb',
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.15s',
    },
    taskItem: {
        padding: '10px 12px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '8px',
        marginBottom: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
};

// =============================================================================
// COMPONENTS
// =============================================================================

function SearchBar({ items }) {
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);

    const results = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return items.filter(item =>
            item.name.toLowerCase().includes(q) ||
            item.type.toLowerCase().includes(q)
        ).slice(0, 8);
    }, [query, items]);

    const handleSelect = (item) => {
        if (item.path.startsWith('http') || item.path.startsWith('obsidian://')) {
            window.open(item.path, '_blank');
        } else {
            window.location.href = item.path;
        }
        setQuery('');
        setShowResults(false);
    };

    return (
        <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>🔍</span>
            <input
                type="text"
                placeholder="Search docs, projects, tools..."
                style={styles.searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
            />
            {showResults && results.length > 0 && (
                <div style={styles.searchResults}>
                    {results.map((item, i) => (
                        <div
                            key={i}
                            style={styles.searchResult}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(99,102,241,0.1)'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                            <span>{item.icon}</span>
                            <span>{item.name}</span>
                            <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '0.75rem' }}>{item.type}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatsRow({ projects }) {
    const active = projects.filter(p => p.status === 'active');
    const shipped = projects.filter(p => p.status === 'shipped');
    const p0 = projects.filter(p => p.priority === 'P0');
    const blocked = projects.filter(p => p.blockers?.length > 0);

    return (
        <div style={styles.statsGrid}>
            <div style={styles.statCard}>
                <div style={styles.statNumber}>{projects.length}</div>
                <div style={styles.statLabel}>Total</div>
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
    );
}

function ProjectsList({ projects, title, icon }) {
    const getBadgeStyle = (priority) => {
        const colors = { P0: '#ef4444', P1: '#f59e0b', P2: '#6366f1', P3: '#4b5563' };
        return { ...styles.badge, background: colors[priority] || colors.P2, color: priority === 'P1' ? '#000' : '#fff' };
    };

    return (
        <div style={styles.card}>
            <div style={styles.cardTitle}>{icon} {title}</div>
            {projects.map(p => (
                <div key={p.id} style={styles.projectCard}>
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{p.name}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>→ {p.next_action}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={getBadgeStyle(p.priority)}>{p.priority}</span>
                        <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{p.owner}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

function QuickActions() {
    const actions = [
        { icon: '➕', label: 'New Project', action: () => alert('Create project via CLI: tracker.py add "Name"') },
        { icon: '📝', label: 'Log Task', action: () => alert('Log task via CLI: queue_manager.py add "Task"') },
        { icon: '📓', label: 'Open Vault', action: () => window.open('obsidian://open?vault=MirrorDNA-Vault', '_blank') },
        { icon: '🔄', label: 'Sync State', action: () => alert('Run: ~/.mirrordna/sync/sync_watcher.sh') },
        { icon: '📡', label: 'Fleet Status', action: () => alert('Run: ~/.mirrordna/fleet/launch_dashboard.sh') },
        { icon: '💰', label: 'Cost Report', action: () => alert('Run: tracker.py report --period week') },
    ];

    return (
        <div style={styles.card}>
            <div style={styles.cardTitle}>⚡ Quick Actions</div>
            <div style={styles.quickActionsGrid}>
                {actions.map((a, i) => (
                    <div
                        key={i}
                        style={styles.quickAction}
                        onClick={a.action}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(99, 102, 241, 0.2)';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(99, 102, 241, 0.1)';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{a.icon}</div>
                        {a.label}
                    </div>
                ))}
            </div>
        </div>
    );
}

function NotificationsPanel({ notifications }) {
    const getStyle = (type) => {
        const base = styles.notification;
        const typeStyles = {
            success: styles.notificationSuccess,
            info: styles.notificationInfo,
            warning: styles.notificationWarning,
        };
        return { ...base, ...typeStyles[type] };
    };

    return (
        <div style={styles.card}>
            <div style={styles.cardTitle}>🔔 Notifications</div>
            {notifications.map(n => (
                <div key={n.id} style={getStyle(n.type)}>
                    <span>{n.message}</span>
                    <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{n.time}</span>
                </div>
            ))}
        </div>
    );
}

function CalendarWidget({ events }) {
    const today = new Date().toISOString().split('T')[0];

    return (
        <div style={styles.card}>
            <div style={styles.cardTitle}>📅 Upcoming</div>
            {events.map((e, i) => (
                <div key={i} style={styles.eventItem}>
                    <div>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{e.title}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{e.date}</div>
                    </div>
                    <span style={{
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '0.65rem',
                        background: e.type === 'deadline' ? 'rgba(239,68,68,0.2)' :
                            e.type === 'meeting' ? 'rgba(99,102,241,0.2)' : 'rgba(107,114,128,0.2)',
                        color: e.type === 'deadline' ? '#ef4444' :
                            e.type === 'meeting' ? '#6366f1' : '#9ca3af'
                    }}>
                        {e.type}
                    </span>
                </div>
            ))}
        </div>
    );
}

function TasksPanel({ tasks }) {
    const getBadgeColor = (priority) => {
        const colors = { P0: '#ef4444', P1: '#f59e0b', P2: '#6366f1' };
        return colors[priority] || '#6b7280';
    };

    return (
        <div style={styles.card}>
            <div style={styles.cardTitle}>📋 Urgent Tasks</div>
            {tasks.map(t => (
                <div key={t.id} style={styles.taskItem}>
                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t.title}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{t.project}</div>
                    </div>
                    <span style={{
                        width: '8px', height: '8px',
                        borderRadius: '50%',
                        background: getBadgeColor(t.priority)
                    }} />
                </div>
            ))}
        </div>
    );
}

function MetricsPanel({ metrics }) {
    return (
        <div style={styles.card}>
            <div style={styles.cardTitle}>📈 Metrics (Today)</div>
            <div style={styles.metricRow}>
                <span>Commits</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>{metrics.commits_today}</span>
            </div>
            <div style={styles.metricRow}>
                <span>Open PRs</span>
                <span style={{ fontWeight: 600 }}>{metrics.open_prs}</span>
            </div>
            <div style={styles.metricRow}>
                <span>Deployments</span>
                <span style={{ fontWeight: 600, color: '#6366f1' }}>{metrics.deployments}</span>
            </div>
            <div style={styles.metricRow}>
                <span>Agents Active</span>
                <span style={{ fontWeight: 600, color: '#f59e0b' }}>{metrics.agents_active}</span>
            </div>
        </div>
    );
}

function IntegrationLinks() {
    const links = [
        { icon: '🪞', label: 'Mirror AI', url: '/mirror' },
        { icon: '📊', label: 'Truth Engine', url: 'https://brief.activemirror.ai' },
        { icon: '📚', label: 'Docs', url: 'https://docs.activemirror.ai' },
        { icon: '⌨️', label: 'GitHub', url: 'https://github.com/MirrorDNA-Reflection-Protocol' },
        { icon: '📓', label: 'Vault', url: 'obsidian://open?vault=MirrorDNA-Vault' },
        { icon: '🔗', label: 'id.activemirror.ai', url: 'https://id.activemirror.ai' },
        { icon: '🧪', label: 'Test Lab', url: '/lab' },
        { icon: '🏠', label: 'Home', url: '/' },
    ];

    return (
        <div style={styles.card}>
            <div style={styles.cardTitle}>🔗 Quick Links</div>
            <div style={styles.integrationLinks}>
                {links.map((l, i) => (
                    <a
                        key={i}
                        href={l.url}
                        target={l.url.startsWith('http') || l.url.startsWith('obsidian') ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        style={styles.integrationLink}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(99,102,241,0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.03)'}
                    >
                        <span>{l.icon}</span>
                        <span>{l.label}</span>
                    </a>
                ))}
            </div>
        </div>
    );
}

// =============================================================================
// MAIN
// =============================================================================

export default function Hub() {
    const [projects] = useState(INITIAL_PROJECTS);
    const [notifications] = useState(SAMPLE_NOTIFICATIONS);
    const [tasks] = useState(SAMPLE_TASKS);
    const [metrics] = useState(SAMPLE_METRICS);
    const [events] = useState(SAMPLE_EVENTS);

    const active = projects.filter(p => p.status === 'active').sort((a, b) => {
        const order = { P0: 0, P1: 1, P2: 2, P3: 3 };
        return order[a.priority] - order[b.priority];
    });

    const shipped = projects.filter(p => p.status === 'shipped').slice(0, 4);

    return (
        <div style={styles.container}>
            <div style={styles.inner}>
                {/* Header */}
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.title}>
                            <span style={styles.glyph}>⟡</span>
                            Command Hub
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '3px' }}>
                            N1 Intelligence • MirrorDNA Control Center
                        </p>
                    </div>
                    <SearchBar items={SEARCHABLE_ITEMS} />
                    <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                        {new Date().toLocaleString()}
                    </div>
                </header>

                {/* Stats */}
                <StatsRow projects={projects} />

                {/* Main Grid */}
                <div style={styles.mainGrid}>
                    {/* Left Column */}
                    <div style={styles.leftColumn}>
                        <ProjectsList projects={active} title="Active Projects" icon="🔄" />
                        <ProjectsList projects={shipped} title="Recently Shipped" icon="✅" />
                        <QuickActions />
                    </div>

                    {/* Right Column */}
                    <div style={styles.rightColumn}>
                        <NotificationsPanel notifications={notifications} />
                        <TasksPanel tasks={tasks} />
                        <CalendarWidget events={events} />
                        <MetricsPanel metrics={metrics} />
                        <IntegrationLinks />
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '30px', textAlign: 'center', color: '#4b5563', fontSize: '0.75rem' }}>
                    ⟡ MirrorDNA • N1 Intelligence • {new Date().getFullYear()}
                </div>
            </div>

            {/* Responsive styles */}
            <style>{`
        @media (max-width: 1024px) {
          .mainGrid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .statsGrid { grid-template-columns: repeat(3, 1fr) !important; }
          .quickActionsGrid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
        </div>
    );
}
