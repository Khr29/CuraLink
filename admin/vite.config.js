import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { checkBackendUrl } from './viteEnvGuard.js'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ command, mode, isPreview }) => {
  // Same resolution Vite uses for import.meta.env (shell > .env.[mode] > .env).
  checkBackendUrl({ command, isPreview, env: loadEnv(mode, root, 'VITE_') })

  return {
    plugins: [
      react(),
      tailwindcss()   // ✅ yaha hona chahiye
    ],
    server: {
      port: 5174
    }
  }
})
