import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

// Base path: GitHub Pages serves project sites from /<repo>/, everything else
// (Cloudflare Pages, Netlify, local dev) serves from the domain root.
const base = process.env.GITHUB_PAGES ? '/whoopity/' : '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
