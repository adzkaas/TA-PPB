-- ==============================================================================
-- MASTER QUERY SUPABASE: SETUP LENGKAP AQUASCAPEHUB (PWA TUGAS AKHIR PPB)
-- Jalankan SELURUH query ini di Supabase: Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SETUP TABEL USERS (Autentikasi & Profil Pengguna/Admin)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  avatar_url  TEXT,
  role        VARCHAR(20) DEFAULT 'pengguna' CHECK (role IN ('pengguna', 'admin')),
  bio         TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Matikan RLS agar API dari PWA bisa login, register, dan update profil tanpa terblokir
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE users TO anon, authenticated, service_role;

-- Masukkan Akun Bawaan (Admin & Pengguna) ke dalam Database Supabase
INSERT INTO users (username, email, password, avatar_url, role, bio)
VALUES
  (
    'Admin Aquascape',
    'admin@aquascapehub.com',
    'admin123',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'admin',
    'Administrator AquascapeHub'
  ),
  (
    'Aquascaper Handal',
    'user@aquascapehub.com',
    'user123',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    'pengguna',
    'Penggemar aquascape'
  )
ON CONFLICT (email) DO UPDATE 
SET 
  role = EXCLUDED.role,
  username = EXCLUDED.username,
  password = EXCLUDED.password;

-- ------------------------------------------------------------------------------
-- 2. SETUP TABEL WISHLIST (Penyimpanan Rencana Tanaman/Biota Per-User)
-- ------------------------------------------------------------------------------
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

-- Pastikan kolom user_id ada (jika sebelumnya tabel wishlist sudah dibuat tanpa user_id)
ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Matikan RLS agar PWA bisa menambah dan menghapus wishlist
ALTER TABLE wishlist DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE wishlist TO anon, authenticated, service_role;

-- Buat index agar pencarian wishlist per-user sangat cepat
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);

-- ------------------------------------------------------------------------------
-- 3. SETUP TABEL PLANTS & FAUNA (Katalog Tanaman & Biota)
-- ------------------------------------------------------------------------------
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE plants TO anon, authenticated, service_role;

ALTER TABLE fauna DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE fauna TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 4. SETUP STORAGE BUCKET: `avatars` (Penyimpanan Foto Profil Pengguna)
-- ------------------------------------------------------------------------------
-- Buat bucket avatars dengan akses PUBLIC
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Berikan izin SELECT (lihat foto publik)
DROP POLICY IF EXISTS "Public read on avatars" ON storage.objects;
CREATE POLICY "Public read on avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Berikan izin INSERT (upload foto baru)
DROP POLICY IF EXISTS "Public insert on avatars" ON storage.objects;
CREATE POLICY "Public insert on avatars"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'avatars');

-- Berikan izin UPDATE (ubah foto)
DROP POLICY IF EXISTS "Public update on avatars" ON storage.objects;
CREATE POLICY "Public update on avatars"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'avatars');

-- Berikan izin DELETE (hapus foto)
DROP POLICY IF EXISTS "Public delete on avatars" ON storage.objects;
CREATE POLICY "Public delete on avatars"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'avatars');

-- ------------------------------------------------------------------------------
-- 5. VERIFIKASI (Pastikan semua tabel & bucket sudah aktif)
-- ------------------------------------------------------------------------------
SELECT id, username, email, role FROM users;
SELECT id, name, public FROM storage.buckets WHERE id = 'avatars';
