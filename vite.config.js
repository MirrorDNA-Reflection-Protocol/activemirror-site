import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

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
