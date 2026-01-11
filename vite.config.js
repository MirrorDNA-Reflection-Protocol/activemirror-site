import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

// Plugin to copy index.html for SPA routing on GitHub Pages
const spaFallbackPlugin = () => ({
    name: 'spa-fallback',
    closeBundle() {
        const distIndex = resolve(__dirname, 'dist/index.html')
        
        // Create 404.html for GitHub Pages SPA fallback
        copyFileSync(distIndex, resolve(__dirname, 'dist/404.html'))
        
        // Ensure /mirror loads the React app (SPA route)
        const mirrorDir = resolve(__dirname, 'dist/mirror')
        if (!existsSync(mirrorDir)) {
            mkdirSync(mirrorDir, { recursive: true })
        }
        copyFileSync(distIndex, resolve(__dirname, 'dist/mirror/index.html'))
        
        console.log('✅ SPA fallbacks created: 404.html, mirror/index.html')
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
