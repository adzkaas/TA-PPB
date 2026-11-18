import { supabase } from "../config/supabaseClient.js";

export const PlantModel = {
  async getAll() {
    const { data, error } = await supabase
      .from("plants")
      .select("id, name, scientific_name, type, difficulty, light, co2, growth_rate, description, care_tips, image_url, created_at");
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("plants")
      .select("id, name, scientific_name, type, difficulty, light, co2, growth_rate, description, care_tips, image_url, created_at")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from("plants")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from("plants")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase.from("plants").delete().eq("id", id);
    if (error) throw error;
    return { message: "Plant deleted successfully" };
  },
};
