import { defineConfig } from '@playwright/test'

const origin = 'http://127.0.0.1:4173'

export default defineConfig({
  testDir: './tests',
  use: { baseURL: origin },
  webServer: {
    command: 'npm exec -- vite preview --host 127.0.0.1 --port 4173 --strictPort',
    url: `${origin}/trello/`
  }
})
