import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// vercel.json sends the full policy as headers; the meta copy keeps it in place
// on hosts that cannot (e.g. `vite preview`, GitHub Pages). Dev is left alone
// because Vite's HMR preamble relies on inline scripts.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "base-uri 'self'",
  "form-action 'none'",
  "object-src 'none'",
].join('; ')

const securityMeta = {
  name: 'security-meta',
  apply: 'build',
  transformIndexHtml: () => [
    { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' },
    { tag: 'meta', attrs: { name: 'referrer', content: 'strict-origin-when-cross-origin' }, injectTo: 'head' },
  ],
}

// Hashed asset names are only known after bundling, so the service worker's
// precache list and cache version are written into dist/sw.js here. The .woff
// fallbacks are skipped: every browser that runs service workers takes woff2.
const swPrecache = {
  name: 'sw-precache',
  apply: 'build',
  writeBundle(options, bundle) {
    const files = Object.keys(bundle)
      .filter((f) => f !== 'index.html' && !f.endsWith('.woff'))
      .sort()
      .map((f) => `./${f}`)
      .concat(recordedAudio.map((verdict) => `./audio/${verdict}.mp3`))
    const version = createHash('sha256').update(files.join()).digest('hex').slice(0, 10)
    const swPath = path.join(options.dir, 'sw.js')
    const source = fs.readFileSync(swPath, 'utf8')
    const marker = "const BUILD = { version: 'dev', files: [] }"
    if (!source.includes(marker)) throw new Error('sw-precache: BUILD marker missing from sw.js')
    fs.writeFileSync(swPath, source.replace(marker, `const BUILD = ${JSON.stringify({ version, files })}`))
  },
}

// Recorded voice notes are optional (see README). Only the files that exist are
// offered to the app and cached for offline use, so missing ones cost nothing.
const AUDIO_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public', 'audio')
const AUDIO_WARN_BYTES = 300 * 1024
const recordedAudio = ['scam', 'safe'].filter((verdict) => {
  const file = path.join(AUDIO_DIR, `${verdict}.mp3`)
  if (!fs.existsSync(file)) return false
  const { size } = fs.statSync(file)
  if (size > AUDIO_WARN_BYTES) {
    console.warn(`audio/${verdict}.mp3 is ${Math.round(size / 1024)} KB; mono 64 kbps keeps it small for slow phones.`)
  }
  return true
})

// Relative base so the build also works when served from a sub-path.
export default defineConfig({
  base: './',
  plugins: [react(), securityMeta, swPrecache],
  define: { __RECORDED_AUDIO__: JSON.stringify(recordedAudio) },
  test: { include: ['src/**/*.test.js'] },
})
