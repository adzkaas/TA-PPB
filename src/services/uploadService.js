import axios from 'axios'
import { BASE_URL, SUPABASE_KEY, IS_SUPABASE } from '../config/api'

// ---------------------------------------------------------------------------
// UploadService — Layanan upload foto ke Supabase Storage (Modul 5)
// Mendukung bucket 'avatars' dengan format gambar terverifikasi
// ---------------------------------------------------------------------------
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

class UploadService {
  /**
   * Upload single image file ke Supabase Storage bucket
   * @param {File} file
   * @param {string} [bucketName='avatars']
   * @returns {Promise<{ success: boolean, data: { url: string, filename: string } }>}
   */
  async uploadImage(file, bucketName = 'avatars') {
    if (!file) {
      throw new Error('Tidak ada file yang dipilih.')
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Format file tidak didukung. Gunakan .jpg, .jpeg, .png, atau .webp.')
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error('Ukuran file maksimal 5 MB.')
    }

    if (IS_SUPABASE) {
      const ext = file.name ? file.name.split('.').pop() : 'jpg'
      const fileName = `avatar_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`

      try {
        const uploadUrl = `${BASE_URL}/storage/v1/object/${bucketName}/${fileName}`
        await axios.post(uploadUrl, file, {
          headers: {
            'Content-Type': file.type || 'image/jpeg',
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          timeout: 30000,
        })
        const publicUrl = `${BASE_URL}/storage/v1/object/public/${bucketName}/${fileName}`
        return {
          success: true,
          data: { url: publicUrl, filename: fileName },
        }
      } catch (err) {
        console.warn('Supabase bucket direct upload error, fallback to data URL:', err)
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        return {
          success: true,
          data: { url: dataUrl, filename: file.name || 'avatar.jpg' },
        }
      }
    }

    throw new Error('Supabase configuration tidak ditemukan.')
  }
}

export default new UploadService()
