import { resolve } from 'path'

import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  root: 'templates',
  plugins: [
    tsconfigPaths(),
    react(),
  ],
  build: {
    outDir: '../build',
    rollupOptions: {
      input: {
        wheel: resolve(__dirname, 'templates/index.html'),
        dashboard: resolve(__dirname, 'templates/dashboard/index.html'),
      },
    },
  },
})
