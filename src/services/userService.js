import { apiClient, IS_SUPABASE } from '../config/api'
import uploadService from './uploadService'

// ---------------------------------------------------------------------------
// UserService — Layanan identitas pengguna, autentikasi, dan profil (Modul 5)
// Berkomunikasi dengan RESTful Web Service Supabase (/rest/v1/users)
// ---------------------------------------------------------------------------
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
    try {
      const key = user.email.toLowerCase().trim()
      const overrides = this.getUserOverrides()
      overrides[key] = {
        ...(overrides[key] || {}),
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
      }
      localStorage.setItem(USER_OVERRIDES_KEY, JSON.stringify(overrides))
    } catch (e) {
      console.warn('[userService] Gagal simpan override:', e)
    }
  }

  async login(email, password) {
    const emailKey = email.toLowerCase().trim()
    const overrides = this.getUserOverrides()
    const override = overrides[emailKey] || {}

    // 1. Coba login via REST API Supabase (/rest/v1/users)
    if (IS_SUPABASE) {
      try {
        const query = `/rest/v1/users?email=eq.${encodeURIComponent(emailKey)}&password=eq.${encodeURIComponent(password)}&select=id,username,email,avatar_url,role,created_at`
        const rows = await apiClient.get(query)
        if (Array.isArray(rows) && rows.length > 0) {
          const user = rows[0]
          const finalUser = {
            ...user,
            avatar_url: override.avatar_url || user.avatar_url,
            username: override.username || user.username,
          }
          this.setCurrentUser(finalUser)
          this.saveUserOverride(finalUser)
          return finalUser
        }
      } catch (err) {
        console.warn('[userService] Supabase login error, checking local/demo:', err.message)
      }
    }

    // 2. Fallback jika offline atau akun demo bawaan
    const demo = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === emailKey && a.password === password,
    )
    if (demo) {
      const { password: _, ...baseUser } = demo
      const mergedUser = {
        ...baseUser,
        ...override,
        avatar_url: override.avatar_url || baseUser.avatar_url,
        username: override.username || baseUser.username,
      }
      this.setCurrentUser(mergedUser)
      return mergedUser
    }

    // 3. Cek akun teregistrasi lokal (fallback offline)
    const localUsers = this.getLocalRegisteredUsers()
    const found = localUsers.find(
      (u) => u.email.toLowerCase() === emailKey && u.password === password,
    )
    if (found) {
      const { password: _, ...baseUser } = found
      const mergedUser = {
        ...baseUser,
        ...override,
        avatar_url: override.avatar_url || baseUser.avatar_url,
        username: override.username || baseUser.username,
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

    // 1. Registrasi langsung ke REST API Supabase (/rest/v1/users)
    if (IS_SUPABASE) {
      try {
        const payload = {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          avatar_url: defaultAvatar,
        }
        const rows = await apiClient.post('/rest/v1/users', payload, {
          headers: { Prefer: 'return=representation' },
        })
        const created = Array.isArray(rows) ? rows[0] : rows
        if (created) {
          this.setCurrentUser(created)
          this.saveUserOverride(created)
          return created
        }
      } catch (err) {
        console.warn('[userService] Supabase register error, fallback ke lokal:', err.message)
      }
    }

    // 2. Fallback offline registration
    const newUser = {
      id: 'local-' + Date.now(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
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
    const email = (payload.email || currentUser.email || '').toLowerCase().trim()

    // 1. Update data di database Supabase via REST API
    if (IS_SUPABASE && email) {
      try {
        const updateData = {}
        if (payload.username !== undefined) updateData.username = payload.username
        if (payload.avatar_url !== undefined) updateData.avatar_url = payload.avatar_url
        if (payload.email !== undefined) updateData.email = payload.email

        const rows = await apiClient.patch(
          `/rest/v1/users?email=eq.${encodeURIComponent(email)}`,
          updateData,
          { headers: { Prefer: 'return=representation' } },
        )
        const updatedFromDb = Array.isArray(rows) ? rows[0] : rows
        if (updatedFromDb) {
          updatedUser = { ...updatedUser, ...updatedFromDb }
        }
      } catch (err) {
        console.warn('[userService] Supabase update user error:', err.message)
      }
    }

    // Simpan ke sesi aktif dan persistensi override
    this.setCurrentUser(updatedUser)
    this.saveUserOverride(updatedUser)

    // Update di local storage jika ada
    const localUsers = this.getLocalRegisteredUsers()
    const idx = localUsers.findIndex(
      (u) => u.email?.toLowerCase() === updatedUser.email?.toLowerCase(),
    )
    if (idx !== -1) {
      localUsers[idx] = { ...localUsers[idx], ...updatedUser }
      localStorage.setItem('aquascapehub_local_users', JSON.stringify(localUsers))
    }

    return updatedUser
  }

  async uploadAvatar(id, file) {
    const currentUser = this.getCurrentUser() || {}
    const email = currentUser.email || 'user@aquascapehub.com'

    try {
      // Gunakan UploadService (Modul 5) untuk upload ke Supabase Storage bucket 'avatars'
      const uploadRes = await uploadService.uploadImage(file, 'avatars')
      if (uploadRes && uploadRes.data?.url) {
        const publicUrl = uploadRes.data.url
        const updated = await this.updateProfile(id, { avatar_url: publicUrl, email })
        this.saveUserOverride(updated)
        return updated
      }
    } catch (err) {
      console.warn('[userService] Upload avatar error:', err.message)
      throw err
    }
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
