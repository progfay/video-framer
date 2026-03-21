import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/video-framer/sw.js')
}

const rootEl = document.getElementById('root')
if (rootEl !== null) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
