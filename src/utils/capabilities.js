/**
 * Sovereign Mirror - Capability Detection
 * Detects device capabilities to determine optimal inference strategy
 */

export async function detectCapabilities() {
    // Check WebGPU support
    const hasWebGPU = !!navigator.gpu;

    // Check device memory (returns GB, defaults to 4 if not available)
    const memoryGB = navigator.deviceMemory || 4;

    // Check if online
    const isOnline = navigator.onLine;

    // Check if mobile
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

    // Check iOS specifically (has stricter memory limits)
    const isIOS = /iPhone|iPad/i.test(navigator.userAgent);

    // Get storage quota
    let storageQuotaMB = 0;
    try {
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            storageQuotaMB = Math.round((estimate.quota || 0) / (1024 * 1024));
        }
    } catch (e) {
        console.log("Storage estimate not available");
    }

    // Determine recommended tier
    let recommendedTier = 'cloud'; // Default to cloud

    if (!hasWebGPU) {
        recommendedTier = 'cloud-only'; // Can't run local at all
    } else if (isIOS || memoryGB < 2) {
        recommendedTier = 'tier1'; // Only small model (135M)
    } else if (memoryGB >= 4 && !isMobile) {
        recommendedTier = 'tier2'; // Can handle full model (1.7B)
    } else {
        recommendedTier = 'tier1'; // Safe default for mobile
    }

    return {
        hasWebGPU,
        memoryGB,
        isOnline,
        isMobile,
        isIOS,
        storageQuotaMB,
        recommendedTier,
        canRunLocal: hasWebGPU && memoryGB >= 1
    };
}

/**
 * Model tier configuration
 */
export const MODEL_TIERS = {
    cloud: {
        name: "Cloud (Llama 3.3-70B)",
        modelId: null, // Uses API
        downloadMB: 0,
        quality: "excellent",
        icon: "⚡"
    },
    tier1: {
        name: "Local Mini (SmolLM2-135M)",
        modelId: "SmolLM2-135M-Instruct-q0f32-MLC",
        downloadMB: 40,
        quality: "basic",
        icon: "🔒"
    },
    tier2: {
        name: "Local Full (SmolLM2-1.7B)",
        modelId: "SmolLM2-1.7B-Instruct-q4f32_1-MLC",
        downloadMB: 1700,
        quality: "good",
        icon: "🧠"
    }
};
