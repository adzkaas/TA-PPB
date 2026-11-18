import { supabase } from "../config/supabaseClient.js";

export const WishlistModel = {
  async getAll(userId) {
    let query = supabase
      .from("wishlist")
      .select("id, user_id, item_id, item_type, item_name, item_image, notes, created_at")
      .order("created_at", { ascending: false });

    // Filter berdasarkan user_id agar wishlist tidak bercampur antar pengguna
    if (userId) {
      query = query.eq("user_id", String(userId));
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("wishlist")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    // Ambil kolom yang valid untuk wishlist
    const userId = String(payload.user_id || payload.userId || "");
    const itemId = String(payload.item_id || payload.itemId || "");
    const itemType = payload.item_type || payload.itemType || "tanaman";
    const itemName = payload.item_name || payload.itemName || "";
    const itemImage = payload.item_image || payload.itemImage || "";
    const notes = payload.notes || "";

    if (!userId) {
      throw new Error("user_id wajib disertakan untuk menyimpan wishlist");
    }

    // Cek apakah item sudah pernah ditambahkan oleh user ini
    const { data: existing } = await supabase
      .from("wishlist")
      .select("id, user_id, item_id, item_type, item_name, item_image, notes, created_at")
      .eq("user_id", userId)
      .eq("item_id", itemId)
      .eq("item_type", itemType)
      .maybeSingle();

    if (existing) {
      return existing;
    }

    const insertData = {
      user_id: userId,
      item_id: itemId,
      item_type: itemType,
      item_name: itemName,
      item_image: itemImage,
      notes: notes,
    };

    const { data, error } = await supabase
      .from("wishlist")
      .insert([insertData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id, userId) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let query = supabase.from("wishlist").delete();

    if (isUUID) {
      query = query.or(`id.eq.${id},item_id.eq.${id}`);
    } else {
      query = query.eq("item_id", id);
    }

    // Jika userId disertakan, pastikan hanya menghapus milik user bersangkutan
    if (userId) {
      query = query.eq("user_id", String(userId));
    }

    const { error } = await query;
    if (error) throw error;
    return { message: "Wishlist item removed successfully" };
  },
};
