import { supabase } from "../database/supabase.js"
import { createNotificacao } from "../../supabase/functions/notification-controller/index.ts"


export const createAgenda = async (agenda) => {
  const { data, error } = await supabase.from("agendas").insert(agenda).select()
  if (error) throw error

  // Criar notificação para o evento criado
  const createdAgenda = data[0]
  if (createdAgenda) {
    const { data: userData } = await supabase.auth.getUser()
    if (userData?.user?.id) {
      // Calcular o tempo de envio da notificação (30 minutos antes)
      const [hours, minutes] = (createdAgenda.start_time || "09:00").split(":")
      const eventDate = new Date(createdAgenda.date)
      eventDate.setHours(parseInt(hours), parseInt(minutes))
      const notificationTime = new Date(eventDate.getTime() - 30 * 60000) // 30 minutos antes

      await createNotificacao(
        userData.user.id,
        `Lembrete: ${createdAgenda.title || "Agenda"} em 30 minutos`,
        notificationTime.toISOString()
      )
    }
  }

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
