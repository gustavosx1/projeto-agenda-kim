
self.addEventListener("push", (event) => {
  console.log("Push recebido:", event.data?.text());

  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: event.data?.text() || "Notificação" };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "Lembrete", {
      body: payload.body || payload.message || "",
      icon: "logo.svg",
      badge: "logo.svg"
    })
  );
});

