import { supabase } from "../supabase/supabase.js"


export const createAgenda = async (agenda) => {
  const { data, error } = await supabase.from("agendas").insert(agenda).select()
  if (error) throw error
  return data[0]
}

export const getAgendas = async () => {
  const { data, error } = await supabase
    .from("agendas")
    .select("*")
    .order("date", { ascending: true });

  if (error) throw error;
  return data;
};

// 
export const getAgendaById = async (id) => {
  const { data, error } = await supabase
    .from("agendas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const updateAgenda = async (id, agenda) => {
  const { data, error } = await supabase
    .from("agendas")
    .update(agenda)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
};

export const deleteAgenda = async (id) => {
  const { error } = await supabase
    .from("agendas")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
};

