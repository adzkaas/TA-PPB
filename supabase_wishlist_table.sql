-- =========================================================
-- QUERY SUPABASE: PENYESUAIAN TABEL WISHLIST PER-USER
-- Aplikasi: AquascapeHub (Tugas Akhir Praktikum PPB)
-- =========================================================

-- 1. Buat Tabel `wishlist` baru (jika belum ada)
CREATE TABLE IF NOT EXISTS wishlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  item_id     TEXT NOT NULL,
  item_type   VARCHAR(50) NOT NULL,
  item_name   VARCHAR(200) NOT NULL,
  item_image  TEXT,
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Jika tabel `wishlist` sudah terlanjur ada sebelumnya,
-- jalankan ALTER TABLE untuk menambahkan kolom `user_id`:
ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS user_id TEXT;

-- 3. Nonaktifkan Row Level Security (RLS) & Berikan Izin Akses Penuh
ALTER TABLE wishlist DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE wishlist TO anon, authenticated, service_role;

-- 4. Buat Index agar query filter per user cepat
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);

-- 5. (Opsional) Hapus data wishlist lama yang belum memiliki user_id agar data bersih:
DELETE FROM wishlist WHERE user_id IS NULL OR user_id = '';
