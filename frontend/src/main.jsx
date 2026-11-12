import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const defaultApiUrl = import.meta.env.DEV
  ? 'http://localhost:3003'
  : 'https://blogify-apcy.onrender.com'

if (configuredApiUrl && !/^https?:\/\//i.test(configuredApiUrl)) {
  console.error(
    `Invalid VITE_API_URL "${configuredApiUrl}". Expected an absolute http(s) URL; using ${defaultApiUrl}.`,
  )
}

axios.defaults.baseURL = configuredApiUrl && /^https?:\/\//i.test(configuredApiUrl)
  ? configuredApiUrl
  : defaultApiUrl

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
