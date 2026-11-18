import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

if (!BASE_URL) {
  console.warn('[api] VITE_API_BASE_URL is not set. Using localhost:3000')
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Response interceptor — unwrap data and normalise errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'Terjadi kesalahan pada server'
    let status = null

    if (error.response) {
      status = error.response.status
      message =
        error.response.data?.message ||
        error.response.data?.error ||
        `Server error (${status})`
    } else if (error.request) {
      message = 'Gagal terhubung ke server. Periksa koneksi internet Anda.'
    } else {
      message = error.message || message
    }

    return Promise.reject({ message, status, raw: error.response?.data })
  },
)

export { apiClient, BASE_URL }
