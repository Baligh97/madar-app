import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
const single = process.env.SINGLE === '1'
export default defineConfig({
  base: './',
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  build: { outDir: single ? 'dist-single' : 'dist', assetsInlineLimit: single ? 100000000 : 4096, chunkSizeWarningLimit: 2000 },
})
