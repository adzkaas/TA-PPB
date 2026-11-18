import axios from 'axios'

// ---------------------------------------------------------------------------
// Base URL & Supabase Key Configuration
// Read from environment variables (.env) — Mengikuti Modul 5 (PWA2_PrakPPB)
// ---------------------------------------------------------------------------
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://gpxyzcmjxwfqabdgkdzm.supabase.co'
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdweHl6Y21qeHdmcWFiZGdrZHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5ODI0OTIsImV4cCI6MjExMDU1ODQ5Mn0.RnZlhyhVx5AWMu-4g4_qXOEKTbLWeJEBDzuBQtfseUc'

const IS_SUPABASE =
  BASE_URL.includes('supabase.co') || Boolean(SUPABASE_KEY)

if (!BASE_URL) {
  console.warn(
    '[api] VITE_API_BASE_URL is not set. API requests will use relative paths.',
  )
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
})

// ---------------------------------------------------------------------------
// Request interceptor — attach Supabase headers (apikey & Bearer auth)
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config) => {
    if (IS_SUPABASE && SUPABASE_KEY) {
      config.headers['apikey'] = SUPABASE_KEY
      if (!config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${SUPABASE_KEY}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ---------------------------------------------------------------------------
// Response interceptor — unwrap response and normalise errors
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'Terjadi kesalahan pada server'
    let status = null

    if (error.response) {
      status = error.response.status
      message =
        error.response.data?.message ||
        error.response.data?.msg ||
        error.response.data?.error ||
        error.response.data?.error_description ||
        `Server error (${status})`
    } else if (error.request) {
      message =
        'Gagal terhubung ke server. Periksa koneksi internet Anda.'
    } else {
      message = error.message || message
    }

    return Promise.reject({
      message,
      status,
      code: error.response?.data?.code,
      raw: error.response?.data,
    })
  },
)

export { apiClient, BASE_URL, SUPABASE_KEY, IS_SUPABASE }
