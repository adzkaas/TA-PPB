import { supabase } from "../config/supabaseClient.js";

export const UserModel = {
  async getAll() {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, email, avatar_url, role, created_at");
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, email, avatar_url, role, created_at")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async login(email, password) {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, email, avatar_url, role, created_at")
      .eq("email", email)
      .eq("password", password)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async register(payload) {
    const { username, email, password, avatar_url, role } = payload;
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username,
          email,
          password,
          avatar_url: avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
          role: role || "pengguna",
        },
      ])
      .select("id, username, email, avatar_url, role, created_at")
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const updateData = {};
    if (payload.username !== undefined) updateData.username = payload.username;
    if (payload.email !== undefined) updateData.email = payload.email;
    if (payload.avatar_url !== undefined) updateData.avatar_url = payload.avatar_url;
    if (payload.role !== undefined) updateData.role = payload.role;

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select("id, username, email, avatar_url, role, created_at")
      .single();
    if (error) throw error;
    return data;
  },
};
