import { supabase } from '../config/supabaseClient.js';

export const UserModel = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, avatar_url, role, bio, created_at');
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, avatar_url, role, bio, created_at')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, avatar_url, role, bio, created_at')
      .eq('email', email.toLowerCase().trim())
      .single();
    if (error) throw error;
    return data;
  },

  async login(email, password) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, avatar_url, role, bio, created_at')
      .eq('email', email.toLowerCase().trim())
      .eq('password', password)
      .single();
    if (error || !data) {
      throw new Error('Email atau password tidak sesuai');
    }
    return data;
  },

  async create(payload) {
    const userPayload = {
      username: payload.username.trim(),
      email: payload.email.toLowerCase().trim(),
      password: payload.password,
      role: payload.role || 'pengguna',
      avatar_url: payload.avatar_url || '',
      bio: payload.bio || '',
    };
    const { data, error } = await supabase
      .from('users')
      .insert([userPayload])
      .select('id, username, email, avatar_url, role, bio, created_at')
      .single();
    if (error) throw error;
    return data;
  },

  async update(idOrEmail, payload) {
    const allowed = ['username', 'avatar_url', 'bio', 'email'];
    const clean = {};
    for (const k of allowed) {
      if (payload[k] !== undefined) clean[k] = payload[k];
    }
    const { data, error } = await supabase
      .from('users')
      .update(clean)
      .or(`id.eq.${idOrEmail},email.eq.${idOrEmail}`)
      .select('id, username, email, avatar_url, role, bio, created_at')
      .single();
    if (error) throw error;
    return data;
  },
};
