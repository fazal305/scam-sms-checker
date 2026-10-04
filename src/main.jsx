import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource/noto-nastaliq-urdu/700.css'
import '@fontsource-variable/noto-naskh-arabic/wght.css'
import './styles/tokens.css'
import './styles/app.css'
import App from './App.jsx'
import { current } from './hooks/useHashRoute.js'

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
