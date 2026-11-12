// بناء خاص لصفحة المعاينة: ملف JS واحد و CSS واحد، و React يُحمَّل من CDN
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react({ jsxRuntime: 'classic' })],
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    outDir: 'dist-artifact', assetsInlineLimit: 100000000, cssCodeSplit: false,
    lib: { entry: 'src/main.jsx', name: 'MadarApp', formats: ['iife'], fileName: () => 'app.js' },
    rollupOptions: { external: ['react', 'react-dom', 'react-dom/client'], output: { globals: { react: 'React', 'react-dom': 'ReactDOM', 'react-dom/client': 'ReactDOM' }, assetFileNames: 'app.[ext]' } },
  },
})
