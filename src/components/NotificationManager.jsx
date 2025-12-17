import { useEffect } from 'react'
import { supabase } from '../database/supabase'

export default function NotificationManager() {
  useEffect(() => {
    const initNotifications = async () => {
      // 1. Registrar service worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          console.log('Service Worker registrado:', registration)

          // 2. Solicitar permissão
          if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission()
          }

          // 3. Se tem pushManager, obter e salvar subscription
          if (registration.pushManager && Notification.permission === 'granted') {
            try {
              const subscription = await registration.pushManager.getSubscription()
              if (subscription) {
                // Obter usuário autenticado
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                  // Salvar subscription no DB
                  await supabase
                    .from('notificacoes')
                    .upsert({
                      user_id: user.id,
                      subscription: subscription.toJSON(),
                      message: 'SUBSCRIPTION_SAVED',
                      send_at: new Date().toISOString(),
                      sent: true
                    }, { onConflict: 'user_id' })
                  console.log('Subscription salva no DB')
                }
              }
            } catch (err) {
              console.error('Erro ao salvar subscription:', err)
            }
          }
        } catch (err) {
          console.log('Service Worker registration failed:', err)
        }
      }
    }

    initNotifications()
  }, [])

  return null
}
