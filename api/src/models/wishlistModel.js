import { supabase } from "../config/supabaseClient.js";

export const WishlistModel = {
  async getAll() {
    const { data, error } = await supabase
      .from("wishlist")
      .select("id, item_id, item_type, item_name, item_image, notes, created_at")
      .order("created_at", { ascending: false });
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
    const { data, error } = await supabase
      .from("wishlist")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    // Bisa menghapus berdasarkan id (UUID) atau item_id
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let query = supabase.from("wishlist").delete();
    if (isUUID) {
      query = query.or(`id.eq.${id},item_id.eq.${id}`);
    } else {
      query = query.eq("item_id", id);
    }
    const { error } = await query;
    if (error) throw error;
    return { message: "Wishlist item removed successfully" };
  },
};
