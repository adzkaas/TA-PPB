import { apiClient } from '../config/api'

const USER_STORAGE_KEY = 'aquascapehub_user'

export const DEMO_ACCOUNTS = [
  {
    id: 'demo-admin-01',
    username: 'Admin Aquascape',
    email: 'admin@aquascapehub.com',
    password: 'admin123',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'demo-user-01',
    username: 'Aquascaper Handal',
    email: 'user@aquascapehub.com',
    password: 'user123',
    role: 'pengguna',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  },
]

class UserService {
  getCurrentUser() {
    try {
      const data = localStorage.getItem(USER_STORAGE_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(USER_STORAGE_KEY)
    } else {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    }
  }

  async login(email, password) {
    try {
      // 1. Coba lewat API backend
      const res = await apiClient.post('/api/users/login', { email, password })
      if (res && res.user) {
        this.setCurrentUser(res.user)
        return res.user
      }
    } catch (err) {
      console.warn('API login error, checking demo/cached accounts:', err.message)
    }

    // 2. Fallback jika offline atau backend belum running
    const demo = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
    )
    if (demo) {
      const { password: _, ...user } = demo
      this.setCurrentUser(user)
      return user
    }

    // Cek juga akun teregistrasi lokal
    const localUsers = this.getLocalRegisteredUsers()
    const found = localUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    )
    if (found) {
      const { password: _, ...user } = found
      this.setCurrentUser(user)
      return user
    }

    throw new Error('Email atau password tidak sesuai')
  }

  async register({ username, email, password, role = 'pengguna', avatar_url = '' }) {
    const defaultAvatar =
      avatar_url ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'

    try {
      // 1. Coba lewat API backend
      const res = await apiClient.post('/api/users/register', {
        username,
        email,
        password,
        role,
        avatar_url: defaultAvatar,
      })
      if (res && res.user) {
        this.setCurrentUser(res.user)
        return res.user
      }
    } catch (err) {
      console.warn('API register error, storing locally:', err.message)
    }

    // 2. Fallback local register
    const newUser = {
      id: 'local-' + Date.now(),
      username,
      email,
      role,
      avatar_url: defaultAvatar,
      created_at: new Date().toISOString(),
    }
    const localUsers = this.getLocalRegisteredUsers()
    localUsers.push({ ...newUser, password })
    localStorage.setItem('aquascapehub_local_users', JSON.stringify(localUsers))
    this.setCurrentUser(newUser)
    return newUser
  }

  async updateProfile(id, payload) {
    const currentUser = this.getCurrentUser() || {}
    let updatedUser = { ...currentUser, ...payload }

    try {
      // 1. Coba lewat API
      const res = await apiClient.put(`/api/users/${id}`, payload)
      if (res && res.user) {
        updatedUser = res.user
      }
    } catch (err) {
      console.warn('API update user error, updating locally:', err.message)
    }

    this.setCurrentUser(updatedUser)
    return updatedUser
  }

  logout() {
    this.setCurrentUser(null)
  }

  getLocalRegisteredUsers() {
    try {
      const raw = localStorage.getItem('aquascapehub_local_users')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }
}

export default new UserService()
