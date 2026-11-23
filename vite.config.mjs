import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/trello/' : '/',
  plugins: [vue()]
}))
