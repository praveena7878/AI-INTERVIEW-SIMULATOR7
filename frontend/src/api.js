// Centralized API Base URL configuration & Zero-Crash Fetch Helper
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const getApiUrl = (path) => {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`
}

export const safeFetch = async (url, options = {}) => {
  const fullUrl = getApiUrl(url)
  try {
    const res = await fetch(fullUrl, options)
    return res
  } catch (err) {
    console.warn(`Fetch to ${fullUrl} failed (${err.message}). Activating client-side fallback.`)
    return { ok: false, status: 503, json: async () => ({ detail: err.message }) }
  }
}
