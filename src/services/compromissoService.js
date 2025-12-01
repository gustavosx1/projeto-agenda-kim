import { supabase } from "../database/supabase.js"
import { createNotificacao } from "./notificacaoService.js"

export const createCompromisso = async (compromisso) => {
  const { data, error } = await supabase.from("compromissos").insert(compromisso).select()
  if (error) throw error
  
  // Criar notificação para o evento criado
  const createdCompromisso = data[0]
  if (createdCompromisso) {
    const { data: userData } = await supabase.auth.getUser()
    if (userData?.user?.id) {
      // Calcular o tempo de envio da notificação (30 minutos antes)
      const [hours, minutes] = (createdCompromisso.start_time || "09:00").split(":")
      const eventDate = new Date(createdCompromisso.date)
      eventDate.setHours(parseInt(hours), parseInt(minutes))
      const notificationTime = new Date(eventDate.getTime() - 30 * 60000) // 30 minutos antes
      
      await createNotificacao(
        userData.user.id,
        `Lembrete: ${createdCompromisso.title || "Compromisso"} em 30 minutos`,
        notificationTime.toISOString()
      )
    }
  }
  
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
