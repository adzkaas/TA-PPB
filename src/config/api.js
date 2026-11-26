import axios from 'axios'

// ---------------------------------------------------------------------------
// Base URL Configuration untuk Express RESTful API
// Saat pengembangan lokal atau di Vercel:
// Menggunakan relative path '' sehingga request /api/... langsung diproses oleh
// backend Express (via Vite proxy saat lokal, atau Vercel serverless di produksi).
// Jika VITE_API_BASE_URL diset di .env (misal http://localhost:3000), URL tersebut akan dipakai.
// ---------------------------------------------------------------------------
const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Response interceptor — unwrap response and normalise errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'Terjadi kesalahan pada server'
    let status = null

    if (error.response) {
      status = error.response.status
      message =
        error.response.data?.error ||
        error.response.data?.message ||
        `Server error (${status})`
    } else if (error.request) {
      message = 'Gagal terhubung ke server API backend.'
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

export { apiClient, BASE_URL }

