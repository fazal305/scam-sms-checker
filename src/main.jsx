import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource/noto-nastaliq-urdu/700.css'
import '@fontsource-variable/noto-naskh-arabic/wght.css'
import './styles/tokens.css'
import './styles/app.css'
import App from './App.jsx'
import { current } from './hooks/useHashRoute.js'
import { init } from './lib/bugwatcher.js'

const { hostname } = window.location
const environment = /^(localhost|127\.0\.0\.1)$/.test(hostname)
  ? 'development'
  : /-git-|-(?=[a-z]*\d)[a-z0-9]{9}-[a-z0-9]+\.vercel\.app$|^deploy-preview-\d+--.+\.netlify\.app$/.test(hostname)
    ? 'staging'
    : 'production'

if (environment !== 'development') {
  init({
    key: 'bwp_pk_PCtYJn1ZNZUZCDt2GlsDBUFx0JLkYxRxtWvUSNxT',
    endpoint: 'https://bugwatcher-pings-api.onrender.com/api/v1/ping',
    environment,
    maxReports: 20,
  })
}

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// The production build ships the check screen prerendered (scripts/prerender.mjs)
// so it paints before the JavaScript arrives; any other screen renders fresh.
if (root.hasChildNodes() && current() === 'home') {
  hydrateRoot(root, app)
} else {
  root.textContent = ''
  createRoot(root).render(app)
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
