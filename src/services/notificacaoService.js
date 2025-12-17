import { supabase } from "../database/supabase.js"

/**
 * Criar notificação no database
 * A edge function detectará e enviará automaticamente
 */
export const createNotificacao = async (userId, message, sendAt) => {
  try {
    // Obter subscription do usuário salva
    const { data: subs, error: subError } = await supabase
      .from('notificacoes')
      .select('subscription')
      .eq('user_id', userId)
      .eq('message', 'SUBSCRIPTION_SAVED')
      .limit(1)

    const subscription = subs && subs.length > 0 ? subs[0].subscription : null

    const { data, error } = await supabase
      .from("notificacoes")
      .insert({
        user_id: userId,
        message,
        send_at: sendAt,
        sent: false,
        subscription: subscription
      })
      .select()

    if (error) throw error
    console.log("Notificação criada no DB:", data[0])
    return data[0]
  } catch (err) {
    console.error("Erro ao criar notificação no database:", err)
    return null
  }
}

/**
 * Enviar notificação visual ao usuário (local)
 * Funciona em PWA com Service Worker
 */
export const sendPushNotification = (title, options = {}) => {
  // Usar Notification API padrão do navegador
  if ('Notification' in window && Notification.permission === 'granted') {
    // Se há service worker registrado, usar através dele
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        options: {
          icon: '/logo.svg',
          badge: '/logo.svg',
          tag: 'agenda-notification',
          ...options
        }
      })
    } else {
      // Fallback: notificação direta (menos confiável em background)
      new Notification(title, {
        icon: '/logo.svg',
        badge: '/logo.svg',
        tag: 'agenda-notification',
        ...options
      })
    }
  }
}

/**
 * Solicitar permissão para notificações
 */
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      return true
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
  }
  return false
}

/**
 * Verificar se notificações estão habilitadas
 */
export const isNotificationEnabled = () => {
  return 'Notification' in window && Notification.permission === 'granted'
}
