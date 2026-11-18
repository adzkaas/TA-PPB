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

  async update(idOrEmail, payload) {
    const updateData = {};
    if (payload.username !== undefined) updateData.username = payload.username;
    if (payload.email !== undefined) updateData.email = payload.email;
    if (payload.avatar_url !== undefined) updateData.avatar_url = payload.avatar_url;
    if (payload.role !== undefined) updateData.role = payload.role;

    // Cek apakah idOrEmail adalah UUID valid
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(idOrEmail));

    let query = supabase.from("users").update(updateData);
    if (isUUID) {
      query = query.eq("id", idOrEmail);
    } else if (payload.email) {
      query = query.eq("email", payload.email);
    } else {
      query = query.eq("email", idOrEmail);
    }

    const { data, error } = await query
      .select("id, username, email, avatar_url, role, created_at")
      .maybeSingle();

    if (error) throw error;
    return data || { id: idOrEmail, ...updateData };
  },

  async uploadAvatar(idOrEmail, base64Data, mimeType = "image/jpeg", email = null) {
    // Pastikan bucket 'avatars' sudah ada
    try {
      await supabase.storage.createBucket("avatars", { public: true });
    } catch (e) {
      // Bucket sudah ada
    }

    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Clean, "base64");

    let ext = "jpg";
    if (mimeType.includes("png")) ext = "png";
    else if (mimeType.includes("webp")) ext = "webp";
    else if (mimeType.includes("gif")) ext = "gif";

    const cleanSafeId = String(idOrEmail).replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `user_${cleanSafeId}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    const updatedUser = await this.update(idOrEmail, {
      avatar_url: publicUrl,
      ...(email ? { email } : {}),
    });

    return { publicUrl, user: updatedUser };
  },
};
