-- =========================================================
-- QUERY SUPABASE: TABEL USERS & PENYESUAIAN ROLE (ADMIN & PENGGUNA)
-- Aplikasi: AquascapeHub (Tugas Akhir Praktikum PPB)
-- =========================================================

-- 1. Buat Tabel `users`
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

-- 2. Nonaktifkan Row Level Security (RLS) & Berikan Izin Akses Penuh
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE users TO anon, authenticated, service_role;

-- 3. Pastikan Izin UPDATE dan DELETE Aktif untuk Tanaman, Biota, dan Wishlist
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE plants TO anon, authenticated, service_role;

ALTER TABLE fauna DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE fauna TO anon, authenticated, service_role;

ALTER TABLE wishlist DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE wishlist TO anon, authenticated, service_role;

-- 4. Masukkan Akun Demo (Admin & Pengguna) Siap Pakai
INSERT INTO users (username, email, password, avatar_url, role, bio)
VALUES
  (
    'Admin Aquascape',
    'admin@aquascapehub.com',
    'admin123',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'admin',
    'Administrator AquascapeHub — Memiliki akses mengedit dan menghapus data tanaman & biota.'
  ),
  (
    'Aquascaper Handal',
    'user@aquascapehub.com',
    'user123',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    'pengguna',
    'Penggemar aquascape gaya Dutch & Iwagumi.'
  )
ON CONFLICT (email) DO UPDATE 
SET 
  role = EXCLUDED.role,
  username = EXCLUDED.username,
  avatar_url = EXCLUDED.avatar_url;

-- Cek apakah data sudah berhasil masuk
SELECT id, username, email, role, created_at FROM users;
