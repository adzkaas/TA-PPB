import { apiClient } from '../config/api'

const USER_STORAGE_KEY = 'aquascapehub_user'
const USER_OVERRIDES_KEY = 'aquascapehub_user_overrides'

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

  getUserOverrides() {
    try {
      const raw = localStorage.getItem(USER_OVERRIDES_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }

  saveUserOverride(user) {
    if (!user || !user.email) return
    const key = user.email.toLowerCase()
    const overrides = this.getUserOverrides()
    overrides[key] = {
      ...(overrides[key] || {}),
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      role: user.role,
    }
    localStorage.setItem(USER_OVERRIDES_KEY, JSON.stringify(overrides))
  }

  async login(email, password) {
    const emailKey = email.toLowerCase().trim()
    const overrides = this.getUserOverrides()
    const override = overrides[emailKey] || {}

    try {
      // 1. Coba lewat API backend
      const res = await apiClient.post('/api/users/login', { email, password })
      if (res && res.user) {
        const finalUser = {
          ...res.user,
          avatar_url: res.user.avatar_url || override.avatar_url,
          username: res.user.username || override.username,
        }
        this.setCurrentUser(finalUser)
        this.saveUserOverride(finalUser)
        return finalUser
      }
    } catch (err) {
      console.warn('API login error, checking demo/cached accounts:', err.message)
    }

    // 2. Fallback jika offline atau backend belum running
    const demo = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === emailKey && a.password === password,
    )
    if (demo) {
      const { password: _, ...baseUser } = demo
      const mergedUser = {
        ...baseUser,
        ...override,
      }
      this.setCurrentUser(mergedUser)
      return mergedUser
    }

    // Cek juga akun teregistrasi lokal
    const localUsers = this.getLocalRegisteredUsers()
    const found = localUsers.find(
      (u) => u.email.toLowerCase() === emailKey && u.password === password,
    )
    if (found) {
      const { password: _, ...baseUser } = found
      const mergedUser = {
        ...baseUser,
        ...override,
      }
      this.setCurrentUser(mergedUser)
      return mergedUser
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
        this.saveUserOverride(res.user)
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
    this.saveUserOverride(newUser)
    return newUser
  }

  async updateProfile(id, payload) {
    const currentUser = this.getCurrentUser() || {}
    let updatedUser = { ...currentUser, ...payload }

    try {
      // 1. Coba lewat API backend
      const res = await apiClient.put(`/api/users/${id}`, {
        ...payload,
        email: payload.email || currentUser.email,
      })
      if (res && res.user) {
        updatedUser = { ...updatedUser, ...res.user }
      }
    } catch (err) {
      console.warn('API update user error, updating locally:', err.message)
    }

    // Simpan ke sesi aktif dan persistensi override permanen
    this.setCurrentUser(updatedUser)
    this.saveUserOverride(updatedUser)

    // Update juga di daftar localUsers jika ada
    const localUsers = this.getLocalRegisteredUsers()
    const idx = localUsers.findIndex((u) => u.email?.toLowerCase() === updatedUser.email?.toLowerCase())
    if (idx !== -1) {
      localUsers[idx] = { ...localUsers[idx], ...updatedUser }
      localStorage.setItem('aquascapehub_local_users', JSON.stringify(localUsers))
    }

    return updatedUser
  }

  async uploadAvatar(id, file) {
    const currentUser = this.getCurrentUser() || {}
    const email = currentUser.email

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async () => {
        const imageBase64 = reader.result
        try {
          // 1. Coba upload lewat API backend ke Supabase Storage
          const res = await apiClient.post(`/api/users/${id}/avatar`, {
            imageBase64,
            mimeType: file.type || 'image/jpeg',
            email,
          })

          if (res && res.user) {
            this.setCurrentUser(res.user)
            this.saveUserOverride(res.user)
            resolve(res.user)
            return
          } else if (res && res.publicUrl) {
            const updated = await this.updateProfile(id, { avatar_url: res.publicUrl, email })
            this.saveUserOverride(updated)
            resolve(updated)
            return
          }
        } catch (err) {
          console.warn('Backend storage upload error, saving offline data URL:', err.message)
        }

        // 2. Fallback jika offline / backend tidak terhubung: simpan URL base64 ke profil & override permanen
        const updated = await this.updateProfile(id, { avatar_url: imageBase64, email })
        this.saveUserOverride(updated)
        resolve(updated)
      }
      reader.onerror = (e) => reject(e)
      reader.readAsDataURL(file)
    })
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
