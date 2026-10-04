import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/noto-nastaliq-urdu/700.css'
import '@fontsource-variable/noto-naskh-arabic/wght.css'
import './styles/tokens.css'
import './styles/app.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
