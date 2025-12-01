export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const registration = await navigator.serviceWorker.register("/sw.js");

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      import.meta.env.VITE_VAPID_PUBLIC_KEY
    ),
  });

  const user = (await supabase.auth.getUser()).data.user;

  await supabase.from("notificacoes").upsert({
    user_id: user.id,
    subscription: subscription.toJSON(),
  });

  return subscription;
}
