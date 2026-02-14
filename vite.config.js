import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'

// All React routes that need SPA fallbacks
const SPA_ROUTES = [
    // Main pages
    'start',
    'setup',
    'mirror',
    'preview',
    'confessions',
    'pricing',
    'demo',
    'hub',
    'lab',
    'mirror-beta',
    'ambient',
    'scan',
    'twins',
    'brief',
    'cast',
    'proof',
    'research',
    'prism',
    'legal',
    'terms',
    'privacy',
    'trust',
    'ecosystem',
    'skills',
    'features',
    // Products
    'products',
    'products/mirrorgate',
    'products/mirrorbrain',
    'products/lingos',
    'products/mirrorrecall',
    'products/glyphtrail',
    'products/trustbydesign',
    'products/agentdna',
    'products/vault',
    // Use Cases
    'use-cases',
    'use-cases/individuals',
    'use-cases/teams',
    'use-cases/enterprise',
    'use-cases/government',
    'use-cases/healthcare',
    'use-cases/education',
    // Docs
    'docs',
    'docs/architecture',
    'docs/self-hosting',
    'docs/api',
    // About
    'about',
    'about/roadmap',
    'about/contact'
];

const ROUTE_META = {
    confessions: {
        title: 'Confession Booth — Active Mirror',
        metaTitle: 'Confession Booth — Active Mirror',
        description: 'Watch blocked AI outputs and real-time governance decisions from MirrorGate. Every block justified. Every event visible.',
        ogUrl: 'https://activemirror.ai/confessions/',
        ogTitle: 'Confession Booth — Active Mirror',
        ogDescription: 'Live flight recorder of blocked outputs and AI guardrail decisions.',
        twitterUrl: 'https://activemirror.ai/confessions/',
        twitterTitle: 'Confession Booth — Active Mirror',
        twitterDescription: 'Live view of blocked outputs, policy triggers, and governance events.',
        canonical: 'https://activemirror.ai/confessions/'
    }
}

const applyRouteMeta = (route, htmlPath) => {
    const meta = ROUTE_META[route]
    if (!meta || !existsSync(htmlPath)) return

    let html = readFileSync(htmlPath, 'utf8')
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${meta.title}</title>`)
    html = html.replace(/<meta name="title" content="[^"]*" \/>/, `<meta name="title" content="${meta.metaTitle}" />`)
    html = html.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${meta.description}" />`)
    html = html.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${meta.ogUrl}" />`)
    html = html.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${meta.ogTitle}" />`)
    html = html.replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${meta.ogDescription}" />`)
    html = html.replace(/<meta name="twitter:url" content="[^"]*" \/>/, `<meta name="twitter:url" content="${meta.twitterUrl}" />`)
    html = html.replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${meta.twitterTitle}" />`)
    html = html.replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${meta.twitterDescription}" />`)
    html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${meta.canonical}" />`)

    writeFileSync(htmlPath, html)
}

// Plugin to copy index.html for SPA routing on GitHub Pages
const spaFallbackPlugin = () => ({
    name: 'spa-fallback',
    closeBundle() {
        const distIndex = resolve(__dirname, 'dist/index.html')
        
        // Create 404.html for GitHub Pages SPA fallback
        copyFileSync(distIndex, resolve(__dirname, 'dist/404.html'))
        
        // Create fallback for each SPA route
        for (const route of SPA_ROUTES) {
            const routeDir = resolve(__dirname, `dist/${route}`)
            if (!existsSync(routeDir)) {
                mkdirSync(routeDir, { recursive: true })
            }
            const targetIndex = resolve(routeDir, 'index.html')
            // Only copy if doesn't exist (don't override static pages)
            if (!existsSync(targetIndex)) {
                copyFileSync(distIndex, targetIndex)
            }
            applyRouteMeta(route, targetIndex)
        }
        
        console.log(`✅ SPA fallbacks created: 404.html, ${SPA_ROUTES.join('/, ')}`)
    }
})

export default defineConfig({
    plugins: [react(), spaFallbackPlugin()],
    base: '/',
    build: {
        outDir: 'dist',
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                'clean-mirror': resolve(__dirname, 'clean-mirror/index.html')
            },
            output: {
                manualChunks: {
                    'web-llm': ['@mlc-ai/web-llm'],
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-motion': ['framer-motion'],
                }
            }
        }
    },
    optimizeDeps: {
        exclude: ['@mlc-ai/web-llm']
    }
})
