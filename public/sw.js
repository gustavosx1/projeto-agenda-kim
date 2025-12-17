// Service Worker para PWA com suporte a notificações

// Evento de instalação
self.addEventListener("install", (event) => {
  console.log("Service Worker instalado")
  self.skipWaiting()
})

// Evento de ativação
self.addEventListener("activate", (event) => {
  console.log("Service Worker ativado")
  event.waitUntil(clients.claim())
})

// Mensagem do cliente para mostrar notificação
self.addEventListener("message", (event) => {
  if (event.data.type === "SHOW_NOTIFICATION") {
    const { title, options } = event.data
    self.registration.showNotification(title, {
      icon: "/logo.svg",
      badge: "/logo.svg",
      ...options
    })
  }
})

// Evento push (para push notifications no futuro)
self.addEventListener("push", (event) => {
  console.log("Push recebido:", event.data?.text())

  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { title: event.data?.text() || "Notificação" }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "Lembrete", {
      body: payload.body || payload.message || "",
      icon: "/logo.svg",
      badge: "/logo.svg"
    })
  )
})

// Evento de clique na notificação
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Procura por uma janela já aberta
      for (let client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus()
        }
      }
      // Se nenhuma janela aberta, abre uma nova
      if (clients.openWindow) {
        return clients.openWindow("/")
      }
    })
  )
})
