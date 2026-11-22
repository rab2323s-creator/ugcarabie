import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom domains on GitHub Pages are served from the origin root.
export default defineConfig({ plugins: [react()], base: '/' })
