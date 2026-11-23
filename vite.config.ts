import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serve em https://rafaarauj.github.io/balneabilidade/
  base: process.env.GITHUB_ACTIONS ? '/balneabilidade/' : '/',
  plugins: [
    vue(),
    tailwindcss(),
  ],
  css: {
    postcss: {},
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})