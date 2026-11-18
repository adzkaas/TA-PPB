import { apiClient } from '../config/api'
import {
  uploadAvatarToSupabase,
  updateUserInSupabase,
  loginWithSupabase,
  registerWithSupabase,
} from '../config/supabase'

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
      console.warn('[userService] Gagal simpan override user:', e)
    }
  }

  async login(email, password) {
    const emailKey = email.toLowerCase().trim()
    const overrides = this.getUserOverrides()
    const override = overrides[emailKey] || {}

    // 1. Coba login langsung ke Supabase REST (paling akurat & selalu sinkron dengan database)
    try {
      const supabaseUser = await loginWithSupabase(emailKey, password)
      if (supabaseUser) {
        const finalUser = {
          ...supabaseUser,
          // Prioritaskan foto dari Supabase jika ada, atau fallback ke override lokal
          avatar_url: override.avatar_url || supabaseUser.avatar_url,
          username: override.username || supabaseUser.username,
        }
        this.setCurrentUser(finalUser)
        this.saveUserOverride(finalUser)
        return finalUser
      }
    } catch (err) {
      console.warn('Direct Supabase login error:', err.message)
    }

    // 2. Coba lewat API backend Express (jika berjalan)
    try {
      const res = await apiClient.post('/api/users/login', { email, password })
      if (res && res.user) {
        const finalUser = {
          ...res.user,
          avatar_url: override.avatar_url || res.user.avatar_url,
          username: override.username || res.user.username,
        }
        this.setCurrentUser(finalUser)
        this.saveUserOverride(finalUser)
        return finalUser
      }
    } catch (err) {
      console.warn('API login error, checking demo/cached accounts:', err.message)
    }

    // 3. Fallback jika offline atau akun demo
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

    // 4. Cek akun teregistrasi lokal
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

    // 1. Coba registrasi langsung ke Supabase
    try {
      const supabaseUser = await registerWithSupabase({
        username,
        email,
        password,
        role,
        avatar_url: defaultAvatar,
      })
      if (supabaseUser) {
        this.setCurrentUser(supabaseUser)
        this.saveUserOverride(supabaseUser)
        return supabaseUser
      }
    } catch (err) {
      console.warn('Direct Supabase register error:', err.message)
    }

    // 2. Coba lewat API backend Express
    try {
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

    // 3. Fallback local register
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
    const email = payload.email || currentUser.email

    // 1. Update langsung ke database Supabase
    if (email) {
      try {
        const supabaseUpdated = await updateUserInSupabase(email, payload)
        if (supabaseUpdated) {
          updatedUser = { ...updatedUser, ...supabaseUpdated }
        }
      } catch (err) {
        console.warn('Direct Supabase update error:', err.message)
      }
    }

    // 2. Update lewat API backend Express (jika aktif)
    try {
      const res = await apiClient.put(`/api/users/${id}`, {
        ...payload,
        email,
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

    // 1. Upload langsung ke Supabase Storage bucket 'avatars' (paling andal & hemat bandwidth)
    try {
      const publicUrl = await uploadAvatarToSupabase(file, id || email)
      if (publicUrl) {
        // Langsung simpan publicUrl ke database Supabase
        await updateUserInSupabase(email, { avatar_url: publicUrl })

        // Update session dan overrides
        const updated = await this.updateProfile(id, { avatar_url: publicUrl, email })
        this.saveUserOverride(updated)
        return updated
      }
    } catch (directErr) {
      console.warn('Direct Supabase storage upload failed, trying backend API:', directErr.message)
    }

    // 2. Fallback upload lewat backend Express jika direct storage diblokir
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async () => {
        const imageBase64 = reader.result
        try {
          const res = await apiClient.post(`/api/users/${id}/avatar`, {
            imageBase64,
            mimeType: file.type || 'image/jpeg',
            email,
          })

          if (res && (res.user || res.publicUrl)) {
            const finalAvatarUrl = res.publicUrl || res.user?.avatar_url
            const updated = await this.updateProfile(id, { avatar_url: finalAvatarUrl, email })
            this.saveUserOverride(updated)
            resolve(updated)
            return
          }
        } catch (err) {
          console.warn('Backend storage upload error:', err.message)
        }

        // 3. Fallback terakhir: simpan URL base64 ke profil & override permanen
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
