// ================================================================
// ACTIVE MIRROR — USER PROFILE & PERSONALIZATION
// ================================================================

export const DEFAULT_PROFILE = {
    name: '',
    customInstructions: '',
    preferences: {
        responseLength: 'medium',
        formality: 'balanced',
        expertise: 'general',
        accentColor: '#00d4ff',
        theme: 'dark'
    },
    stats: {
        firstUse: null,
        totalSessions: 0,
        totalMessages: 0,
        currentStreak: 0,
        lastActiveDate: null
    },
    quickActions: [
        { id: 'summarize', label: '📝 Summarize', prompt: 'Summarize the above concisely in 2-3 sentences.' },
        { id: 'explain', label: '💡 Simplify', prompt: 'Explain this simply, as if I\'m new to the topic.' },
        { id: 'challenge', label: '⚔️ Challenge', prompt: 'Challenge this thinking. What am I missing or getting wrong?' },
        { id: 'expand', label: '🔍 Go Deeper', prompt: 'Expand on this with more detail and examples.' }
    ],
    starredSessions: []
};

export function loadProfile() {
    try {
        var saved = localStorage.getItem('activemirror_profile');
        if (saved) {
            var profile = JSON.parse(saved);
            return Object.assign({}, DEFAULT_PROFILE, profile, {
                preferences: Object.assign({}, DEFAULT_PROFILE.preferences, profile.preferences || {}),
                stats: Object.assign({}, DEFAULT_PROFILE.stats, profile.stats || {}),
                quickActions: profile.quickActions || DEFAULT_PROFILE.quickActions
            });
        }
    } catch (e) {
        console.warn('[Profile] Load failed:', e);
    }
    return Object.assign({}, DEFAULT_PROFILE, { stats: Object.assign({}, DEFAULT_PROFILE.stats, { firstUse: new Date().toISOString() }) });
}

export function saveProfile(profile) {
    try {
        localStorage.setItem('activemirror_profile', JSON.stringify(profile));
        return true;
    } catch (e) {
        console.warn('[Profile] Save failed:', e);
        return false;
    }
}

export function updateStreak(profile) {
    var today = new Date().toDateString();
    var lastActive = profile.stats.lastActiveDate ? new Date(profile.stats.lastActiveDate).toDateString() : null;
    
    if (lastActive === today) {
        return profile;
    }
    
    var yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastActive === yesterday) {
        profile.stats.currentStreak = (profile.stats.currentStreak || 0) + 1;
    } else {
        profile.stats.currentStreak = 1;
    }
    
    profile.stats.lastActiveDate = new Date().toISOString();
    return profile;
}

export function getWelcomeMessage(profile, recentSessions) {
    var parts = [];
    var name = profile.name ? profile.name.split(' ')[0] : '';
    
    // Time-based greeting
    var hour = new Date().getHours();
    var timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    
    if (name) {
        parts.push(timeGreeting + ', ' + name + '.');
    } else {
        parts.push(timeGreeting + '.');
    }
    
    // Streak
    if (profile.stats.currentStreak > 1) {
        parts.push('Day ' + profile.stats.currentStreak + ' together.');
    }
    
    // Last conversation hint
    if (recentSessions && recentSessions.length > 0 && recentSessions[0].title && recentSessions[0].title !== 'New Session') {
        var title = recentSessions[0].title;
        if (title.length > 35) title = title.substring(0, 35) + '...';
        parts.push('Continue: "' + title + '"?');
    }
    
    return parts.join(' ');
}

export function applyTheme(theme, accentColor) {
    var root = document.documentElement;
    
    if (accentColor) {
        root.style.setProperty('--accent', accentColor);
        root.style.setProperty('--accent-glow', accentColor + '40');
    }
    
    var effectiveTheme = theme;
    if (theme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    root.setAttribute('data-theme', effectiveTheme);
}

export function formatStats(stats) {
    var daysSinceFirst = stats.firstUse 
        ? Math.floor((Date.now() - new Date(stats.firstUse).getTime()) / 86400000) + 1
        : 1;
    
    return {
        daysWithMirror: daysSinceFirst,
        currentStreak: stats.currentStreak || 1,
        totalSessions: stats.totalSessions || 0,
        totalMessages: stats.totalMessages || 0
    };
}

export function exportAllData(profile, sessions) {
    var data = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        activeMirror: true,
        profile: profile,
        sessions: sessions
    };
    
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'activemirror-backup-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function exportSessionMarkdown(session) {
    var md = '# ' + (session.title || 'Conversation') + '\n';
    md += '*Active Mirror • ' + new Date(session.createdAt || Date.now()).toLocaleDateString() + '*\n\n---\n\n';
    
    if (session.messages) {
        for (var i = 0; i < session.messages.length; i++) {
            var msg = session.messages[i];
            var role = msg.role === 'user' ? '**You**' : '**Mirror**';
            md += role + '\n\n' + msg.content + '\n\n---\n\n';
        }
    }
    
    var blob = new Blob([md], { type: 'text/markdown' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    var filename = (session.title || 'conversation').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    a.download = filename + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Keyboard shortcuts
export const SHORTCUTS = {
    'k': { mod: true, action: 'newChat', desc: 'New chat' },
    '/': { mod: true, action: 'focusInput', desc: 'Focus input' },
    ',': { mod: true, action: 'openSettings', desc: 'Settings' },
    'e': { mod: true, action: 'exportChat', desc: 'Export chat' },
    's': { mod: true, action: 'starSession', desc: 'Star session' },
    '1': { mod: true, action: 'quickAction0', desc: 'Summarize' },
    '2': { mod: true, action: 'quickAction1', desc: 'Simplify' },
    '3': { mod: true, action: 'quickAction2', desc: 'Challenge' },
    '4': { mod: true, action: 'quickAction3', desc: 'Go deeper' },
    'Escape': { mod: false, action: 'closeModal', desc: 'Close' }
};

export function setupKeyboardShortcuts(handler) {
    document.addEventListener('keydown', function(e) {
        // Skip if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            if (e.key !== 'Escape') return;
        }
        
        var isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
        var mod = isMac ? e.metaKey : e.ctrlKey;
        
        var shortcut = SHORTCUTS[e.key];
        if (shortcut) {
            if (shortcut.mod && !mod) return;
            if (!shortcut.mod && mod) return;
            
            e.preventDefault();
            handler(shortcut.action);
        }
    });
}
