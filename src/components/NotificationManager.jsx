import { useEffect } from 'react'
import { supabase } from '../database/supabase'

export default function NotificationManager() {
  useEffect(() => {
    const initNotifications = async () => {
      if (!('serviceWorker' in navigator)) return

      try {
        const registration = await navigator.serviceWorker.register('/sw.js')

        // Solicitar permissão e salvar subscription
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission()
        }

        if (registration.pushManager && Notification.permission === 'granted') {
          const subscription = await registration.pushManager.getSubscription()
          if (subscription) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              await supabase.from('notificacoes').upsert({
                user_id: user.id,
                subscription: subscription.toJSON(),
                message: 'SUBSCRIPTION_SAVED',
                send_at: new Date().toISOString(),
                sent: true
              }, { onConflict: 'user_id' })
            }
          }
        }
      } catch (err) {
        console.error('Erro ao inicializar notificações:', err)
      }
    }

    initNotifications()
  }, [])

  return null
}
