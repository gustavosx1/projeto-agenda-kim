import { useEffect } from 'react'
import { requestNotificationPermission } from '../services/notificacaoService'

export async function NotificationManager() {
  useEffect(() => {
    async function init() {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("SW registrado:", registration);

        await requestNotificationPermission();
      }
    }
    init();
  }, []);


  return null
}
