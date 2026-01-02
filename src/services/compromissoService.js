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

export const createCompromisso = async (compromisso) => {
  const { data, error } = await supabase.from("compromissos").insert(compromisso).select()
  if (error) throw error

  const createdCompromisso = data[0]
  if (createdCompromisso) {
    const { data: userData } = await supabase.auth.getUser()
    if (userData?.user?.id) {
      await createEventNotification(userData.user.id, createdCompromisso, 'compromisso')
    }
  }

  return createdCompromisso
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
