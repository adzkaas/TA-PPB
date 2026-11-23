import { supabase } from '../config/supabaseClient.js';

export const WishlistModel = {
  async getAll(userId) {
    let query = supabase.from('wishlist').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async create(payload) {
    const clean = {
      user_id: String(payload.user_id),
      item_id: String(payload.item_id),
      item_type: payload.item_type,
      item_name: payload.item_name,
      item_image: payload.item_image || '',
      notes: payload.notes || '',
    };
    const { data, error } = await supabase
      .from('wishlist')
      .insert([clean])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(targetId, userId) {
    let query = supabase.from('wishlist').delete();
    if (userId) {
      query = query.eq('user_id', String(userId));
    }
    const { error } = await query.or(`id.eq.${targetId},item_id.eq.${targetId}`);
    if (error) throw error;
    return { message: 'Item berhasil dihapus dari wishlist' };
  },
};
