import { supabase } from "../database/supabase.js"

/**
 * Criar notificação no database (edge function enviará automaticamente)
 */
export const createNotificacao = async (userId, message, sendAt) => {
  try {
    // Obter subscription do usuário
    const { data: subs } = await supabase
      .from('notificacoes')
      .select('subscription')
      .eq('user_id', userId)
      .eq('message', 'SUBSCRIPTION_SAVED')
      .limit(1)

    // Montar objeto de inserção dinamicamente
    const notificationData = {
      user_id: userId,
      message,
      send_at: sendAt,
      sent: false
    }

    // Adicionar subscription apenas se existir
    if (subs?.[0]?.subscription) {
      notificationData.subscription = subs[0].subscription
    }

    const { data, error } = await supabase
      .from("notificacoes")
      .insert(notificationData)
      .select()

    if (error) throw error
    return data?.[0] || null
  } catch (err) {
    console.error("Erro ao criar notificação:", err)
    return null
  }
}

/**
 * Enviar notificação visual imediata ao usuário
 */
export const sendPushNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const notificationOptions = {
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: 'agenda-notification',
    ...options
  }

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      options: notificationOptions
    })
  } else {
    new Notification(title, notificationOptions)
  }
}

/**
 * Solicitar permissão para notificações
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

/**
 * Verificar se notificações estão habilitadas
 */
export const isNotificationEnabled = () => {
  return 'Notification' in window && Notification.permission === 'granted'
}
