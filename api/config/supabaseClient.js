import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_API_BASE_URL ||
  'https://gpxyzcmjxwfqabdgkdzm.supabase.co';

const supabaseKey =
  process.env.SUPABASE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Backend Supabase] SUPABASE_URL atau SUPABASE_KEY belum terisi di .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
