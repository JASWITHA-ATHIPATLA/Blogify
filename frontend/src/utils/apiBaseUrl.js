const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const defaultApiUrl = import.meta.env.DEV
  ? 'http://localhost:3003'
  : 'https://blogify-apcy.onrender.com'

function isValidApiUrl(value) {
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname)
  } catch {
    return false
  }
}

const hasValidConfiguredApiUrl = configuredApiUrl && isValidApiUrl(configuredApiUrl)

if (configuredApiUrl && !hasValidConfiguredApiUrl) {
  console.error(
    `Invalid VITE_API_URL "${configuredApiUrl}". Expected an absolute http(s) URL; using ${defaultApiUrl}.`,
  )
}

const apiBaseUrl = hasValidConfiguredApiUrl ? configuredApiUrl : defaultApiUrl

export default apiBaseUrl
