import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: '/',
    build: {
        outDir: 'dist',
        chunkSizeWarningLimit: 1000, // Suppress warnings for intentionally large chunks
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split WebLLM into its own chunk (only loaded when needed)
                    'web-llm': ['@mlc-ai/web-llm'],
                    // Split React ecosystem
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    // Split animations
                    'vendor-motion': ['framer-motion'],
                }
            }
        }
    },
    optimizeDeps: {
        exclude: ['@mlc-ai/web-llm'] // Don't pre-bundle, load on demand
    }
})
