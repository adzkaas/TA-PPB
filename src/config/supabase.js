// Konfigurasi Supabase Client & Helper Direct REST API
// Memungkinkan frontend beroperasi dan menyimpan foto profil langsung ke Supabase Storage & Database
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://gpxyzcmjxwfqabdgkdzm.supabase.co'
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdweHl6Y21qeHdmcWFiZGdrZHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5ODI0OTIsImV4cCI6MjExMDU1ODQ5Mn0.RnZlhyhVx5AWMu-4g4_qXOEKTbLWeJEBDzuBQtfseUc'

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
}

/**
 * Kompresi dan resize gambar di browser sebelum diupload
 * Menghasilkan file JPEG berukuran ringan (~40-80KB) dengan kualitas tinggi
 */
export async function compressAvatar(file, maxSize = 500) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width)
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height)
            height = maxSize
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            resolve(blob || file)
          },
          'image/jpeg',
          0.85,
        )
      }
      img.onerror = () => resolve(file)
    }
    reader.onerror = () => resolve(file)
  })
}

/**
 * Upload foto langsung ke Supabase Storage bucket 'avatars'
 */
export async function uploadAvatarToSupabase(file, userIdentifier) {
  try {
    const compressedBlob = await compressAvatar(file, 500)
    const safeId = String(userIdentifier || 'user').replace(/[^a-zA-Z0-9_-]/g, '_')
    const fileName = `avatar_${safeId}_${Date.now()}.jpg`

    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/avatars/${fileName}`

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'image/jpeg',
      },
      body: compressedBlob,
    })

    if (!res.ok) {
      const errText = await res.text()
      console.warn('[supabaseStorage] Gagal upload:', errText)
      throw new Error(`Upload gagal (${res.status}): ${errText}`)
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`
    return publicUrl
  } catch (err) {
    console.warn('[supabaseStorage] Error direct upload:', err.message)
    throw err
  }
}

/**
 * Update data user di tabel `users` Supabase secara langsung
 */
export async function updateUserInSupabase(email, payload) {
  if (!email) return null
  try {
    const updateData = {}
    if (payload.username !== undefined) updateData.username = payload.username
    if (payload.avatar_url !== undefined) updateData.avatar_url = payload.avatar_url
    if (payload.email !== undefined) updateData.email = payload.email

    const url = `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(updateData),
    })

    if (res.ok) {
      const rows = await res.json()
      return Array.isArray(rows) && rows.length > 0 ? rows[0] : null
    }
  } catch (err) {
    console.warn('[supabaseRest] Update user error:', err.message)
  }
  return null
}

/**
 * Login langsung ke tabel `users` Supabase
 */
export async function loginWithSupabase(email, password) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(
      email,
    )}&password=eq.${encodeURIComponent(password)}&select=id,username,email,avatar_url,role,created_at`
    const res = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (res.ok) {
      const rows = await res.json()
      if (Array.isArray(rows) && rows.length > 0) {
        return rows[0]
      }
    }
  } catch (err) {
    console.warn('[supabaseRest] Login error:', err.message)
  }
  return null
}

/**
 * Register langsung ke tabel `users` Supabase
 */
export async function registerWithSupabase({ username, email, password, role = 'pengguna', avatar_url = '' }) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/users`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        role,
        avatar_url:
          avatar_url ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      }),
    })

    if (res.ok) {
      const rows = await res.json()
      if (Array.isArray(rows) && rows.length > 0) {
        return rows[0]
      }
    }
  } catch (err) {
    console.warn('[supabaseRest] Register error:', err.message)
  }
  return null
}

// =========================================================
// HELPER DIRECT REST SUPABASE: TANAMAN (PLANTS)
// =========================================================

export async function fetchPlantsFromSupabase() {
  const url = `${SUPABASE_URL}/rest/v1/plants?select=*&order=created_at.desc`
  const res = await fetch(url, { method: 'GET', headers })
  if (!res.ok) throw new Error(`Supabase error (${res.status})`)
  return await res.json()
}

export async function updatePlantInSupabase(id, payload) {
  const allowed = [
    'name', 'scientific_name', 'type', 'difficulty', 'light',
    'co2', 'growth_rate', 'description', 'care_tips', 'image_url',
  ]
  const clean = {}
  for (const k of allowed) {
    if (payload[k] !== undefined) clean[k] = payload[k]
  }

  const url = `${SUPABASE_URL}/rest/v1/plants?id=eq.${id}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(clean),
  })
  if (!res.ok) throw new Error(`Supabase update error (${res.status})`)
  const rows = await res.json()
  return rows?.[0] || clean
}

export async function deletePlantFromSupabase(id) {
  const url = `${SUPABASE_URL}/rest/v1/plants?id=eq.${id}`
  const res = await fetch(url, { method: 'DELETE', headers })
  if (!res.ok) throw new Error(`Supabase delete error (${res.status})`)
  return true
}

export async function createPlantInSupabase(payload) {
  const url = `${SUPABASE_URL}/rest/v1/plants`
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Supabase create error (${res.status})`)
  const rows = await res.json()
  return rows?.[0]
}

// =========================================================
// HELPER DIRECT REST SUPABASE: BIOTA (FAUNA)
// =========================================================

export async function fetchFaunaFromSupabase() {
  const url = `${SUPABASE_URL}/rest/v1/fauna?select=*&order=created_at.desc`
  const res = await fetch(url, { method: 'GET', headers })
  if (!res.ok) throw new Error(`Supabase error (${res.status})`)
  return await res.json()
}

export async function updateFaunaInSupabase(id, payload) {
  const allowed = [
    'name', 'scientific_name', 'type', 'difficulty', 'water_temp',
    'ph_range', 'tank_size', 'compatibility', 'description', 'care_tips', 'image_url',
  ]
  const clean = {}
  for (const k of allowed) {
    if (payload[k] !== undefined) clean[k] = payload[k]
  }

  const url = `${SUPABASE_URL}/rest/v1/fauna?id=eq.${id}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(clean),
  })
  if (!res.ok) throw new Error(`Supabase update error (${res.status})`)
  const rows = await res.json()
  return rows?.[0] || clean
}

export async function deleteFaunaFromSupabase(id) {
  const url = `${SUPABASE_URL}/rest/v1/fauna?id=eq.${id}`
  const res = await fetch(url, { method: 'DELETE', headers })
  if (!res.ok) throw new Error(`Supabase delete error (${res.status})`)
  return true
}

export async function createFaunaInSupabase(payload) {
  const url = `${SUPABASE_URL}/rest/v1/fauna`
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Supabase create error (${res.status})`)
  const rows = await res.json()
  return rows?.[0]
}

// =========================================================
// HELPER DIRECT REST SUPABASE: WISHLIST
// =========================================================

export async function fetchWishlistFromSupabase(userId) {
  let url = `${SUPABASE_URL}/rest/v1/wishlist?select=*&order=created_at.desc`
  if (userId) {
    url = `${SUPABASE_URL}/rest/v1/wishlist?user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc`
  }
  const res = await fetch(url, { method: 'GET', headers })
  if (!res.ok) throw new Error(`Supabase wishlist error (${res.status})`)
  return await res.json()
}

export async function addWishlistToSupabase(payload) {
  const url = `${SUPABASE_URL}/rest/v1/wishlist`
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Supabase wishlist add error (${res.status})`)
  const rows = await res.json()
  return rows?.[0]
}

export async function removeWishlistFromSupabase(id, userId) {
  let url = `${SUPABASE_URL}/rest/v1/wishlist?id=eq.${id}`
  if (userId) {
    url = `${SUPABASE_URL}/rest/v1/wishlist?id=eq.${id}&user_id=eq.${encodeURIComponent(userId)}`
  }
  const res = await fetch(url, { method: 'DELETE', headers })
  if (!res.ok) {
    // Coba hapus berdasarkan item_id jika id adalah item_id
    let fallbackUrl = `${SUPABASE_URL}/rest/v1/wishlist?item_id=eq.${id}`
    if (userId) {
      fallbackUrl += `&user_id=eq.${encodeURIComponent(userId)}`
    }
    await fetch(fallbackUrl, { method: 'DELETE', headers })
  }
  return true
}
