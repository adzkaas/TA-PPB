import { supabase } from '../config/supabaseClient.js';

export const PlantModel = {
  async getAll() {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('plants')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const allowed = [
      'name',
      'scientific_name',
      'type',
      'difficulty',
      'light',
      'co2',
      'growth_rate',
      'description',
      'care_tips',
      'image_url',
    ];
    const clean = {};
    for (const k of allowed) {
      if (payload[k] !== undefined) clean[k] = payload[k];
    }
    const { data, error } = await supabase
      .from('plants')
      .update(clean)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase
      .from('plants')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Tanaman berhasil dihapus' };
  },
};
