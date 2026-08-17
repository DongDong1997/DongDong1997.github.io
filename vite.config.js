import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 关键: 使用相对路径,这样无论部署到 username.github.io 还是 username.github.io/repo 都能正常工作
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})