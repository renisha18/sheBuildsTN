import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { SITE_URL } from './src/siteConfig.js'

// Fills %SITE_URL% (src/siteConfig.js) into index.html, and into the built robots.txt and
// sitemap.xml (files in public/ are copied as they are, so they're rewritten in dist after the
// build).
function siteUrl() {
  let outDir = 'dist'
  return {
    name: 'site-url',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', SITE_URL),
    async closeBundle() {
      for (const file of ['robots.txt', 'sitemap.xml']) {
        const target = path.join(outDir, file)
        const text = await readFile(target, 'utf8').catch(() => null)
        if (text !== null) await writeFile(target, text.replaceAll('%SITE_URL%', SITE_URL))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrl()],
})
