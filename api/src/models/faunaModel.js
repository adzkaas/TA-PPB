import { supabase } from "../config/supabaseClient.js";

export const FaunaModel = {
  async getAll() {
    const { data, error } = await supabase
      .from("fauna")
      .select("id, name, scientific_name, type, difficulty, water_temp, ph_range, tank_size, compatibility, description, care_tips, image_url, created_at");
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("fauna")
      .select("id, name, scientific_name, type, difficulty, water_temp, ph_range, tank_size, compatibility, description, care_tips, image_url, created_at")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from("fauna")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const allowed = [
      "name",
      "scientific_name",
      "type",
      "difficulty",
      "water_temp",
      "ph_range",
      "tank_size",
      "compatibility",
      "description",
      "care_tips",
      "image_url",
    ];
    const cleanPayload = {};
    for (const key of allowed) {
      if (payload[key] !== undefined) {
        cleanPayload[key] = payload[key];
      }
    }

    const { data, error } = await supabase
      .from("fauna")
      .update(cleanPayload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase.from("fauna").delete().eq("id", id);
    if (error) throw error;
    return { message: "Fauna deleted successfully" };
  },
};
