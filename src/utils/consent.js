/**
 * ⟡ Consent Utility — Shared session consent management
 *
 * Once user passes Mirror Proof on ANY AI page, they're good for the session.
 * This prevents annoying re-consent while maintaining legal coverage.
 */

// Check if user has valid consent for this session
export const hasSessionConsent = () => {
    try {
        const proof = sessionStorage.getItem('mirrorProof');
        if (!proof) return false;

        const data = JSON.parse(proof);
        // Verify it has required fields
        return !!(data.hash && data.timestamp && data.acks?.length >= 3);
    } catch {
        return false;
    }
};

// Get the proof hash if it exists
export const getProofHash = () => {
    try {
        const proof = sessionStorage.getItem('mirrorProof');
        if (!proof) return null;
        return JSON.parse(proof).hash;
    } catch {
        return null;
    }
};

// Generate a proof hash
export const generateProofHash = (acks, timestamp) => {
    const data = `mirror:${acks.join(':')}:${timestamp}:${navigator.userAgent.slice(0, 20)}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `⟡${hex.slice(0, 4)}-${hex.slice(4, 8)}`.toUpperCase();
};

// Set consent (called after passing Mirror Proof)
export const setSessionConsent = (hash, acks) => {
    sessionStorage.setItem('mirrorProof', JSON.stringify({
        hash,
        timestamp: Date.now(),
        acks
    }));
};

// Quick consent for lighter pages (single acknowledgment)
export const setQuickConsent = (feature) => {
    const existing = hasSessionConsent();
    if (existing) return; // Already has full consent

    // Set a lighter consent marker
    sessionStorage.setItem('quickConsent', JSON.stringify({
        feature,
        timestamp: Date.now()
    }));
};

export const hasQuickConsent = (feature) => {
    if (hasSessionConsent()) return true; // Full consent covers everything

    try {
        const quick = sessionStorage.getItem('quickConsent');
        if (!quick) return false;
        const data = JSON.parse(quick);
        return data.feature === feature || data.feature === 'all';
    } catch {
        return false;
    }
};
