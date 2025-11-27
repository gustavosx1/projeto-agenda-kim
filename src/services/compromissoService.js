import { supabase } from "../supabase/supabase.js"

export const createCompromisso = async (compromisso) => {
  const { data, error } = await supabase.from("compromissos").insert(compromisso).select()
  if (error) throw error
  return data[0]
}

export const getCompromissos = async () => {
  const { data, error } = await supabase
    .from("compromissos")
    .select("*")
    .order("date", { ascending: true });

  if (error) throw error;
  return data;
};

export const getCompromissoById = async (id) => {
  const { data, error } = await supabase
    .from("compromissos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const updateCompromisso = async (id, compromisso) => {
  const { data, error } = await supabase
    .from("compromissos")
    .update(compromisso)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
};

export const deleteCompromisso = async (id) => {
  const { error } = await supabase
    .from("compromissos")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
};
