import { supabase } from "../database/supabase.js"
import { createNotificacao, sendPushNotification } from "./notificacaoService.js"

const createEventNotification = async (userId, event, type) => {
  const [hours, minutes] = (event.start_time || "09:00").split(":")
  const eventDate = new Date(event.date)
  eventDate.setHours(parseInt(hours), parseInt(minutes))
  const notificationTime = new Date(eventDate.getTime() - 30 * 60000)

  const emoji = type === 'agenda' ? '📅' : '⏰'
  const typeLabel = type === 'agenda' ? 'Agenda' : 'Compromisso'

  await createNotificacao(
    userId,
    `Lembrete: ${event.title || typeLabel} em 30 minutos`,
    notificationTime.toISOString()
  )

  sendPushNotification(
    `${emoji} ${event.title || `Novo ${typeLabel}`}`,
    {
      body: `Criado para ${event.start_time || ""}`,
      tag: `${type}-${event.id}`
    }
  )
}

export const createAgenda = async (agenda) => {
  const { data, error } = await supabase.from("agendas").insert(agenda).select()
  if (error) throw error

  const createdAgenda = data[0]
  if (createdAgenda) {
    const { data: userData } = await supabase.auth.getUser()
    if (userData?.user?.id) {
      await createEventNotification(userData.user.id, createdAgenda, 'agenda')
    }
  }

  return createdAgenda
}

export const getAgendas = async () => {
  const { data, error } = await supabase
    .from("agendas")
    .select("*")
    .order("date", { ascending: true });

  if (error) throw error;
  return data;
};

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
