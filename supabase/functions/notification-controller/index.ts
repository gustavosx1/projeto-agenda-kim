// notifications-controller/index.js
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "../../../src/database/supabase.js"
import webpush from "web-push"
import fetch from "node-fetch";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase env vars");
  Deno.exit(1);
}

webpush.setVapidDetails(
  "mailto: gustavosantos.kng@gmail.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  global: { headers: { "x-edge-runtime": "deno" } }
});

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const CONTROL_TOKEN = Deno.env.get("CONTROLLER_TOKEN");
    if (CONTROL_TOKEN && token !== CONTROL_TOKEN) {
      return new Response("Unauthorized", { status: 401 });
    }

    const now = new Date().toISOString();
    const { data: pending, error } = await supabase
      .from("scheduled_notifications")
      .select("*")
      .eq("sent", false)
      .lte("send_at", now)
      .order("send_at", { ascending: true })
      .limit(100);

    if (error) {
      console.error("Supabase select error:", error);
      return new Response("Internal error", { status: 500 });
    }

    if (!pending || pending.length === 0) {
      return new Response("No pending notifications");
    }

    for (const item of pending) {
      try {
        const subscription = typeof item.subscription === "string"
          ? JSON.parse(item.subscription)
          : item.subscription;

        await webpush.sendNotification(
          subscription,
          JSON.stringify({ title: item.title, message: item.message, icon: "/logo.svg", badge:"/logo.svg", id: item.id })
        );

        const { error: updateErr } = await supabase
          .from("notificacoes")
          .update({ sent: true, sent_at: new Date().toISOString() })
          .eq("id", item.id);

        if (updateErr) console.error("Update sent flag error:", updateErr);
      } catch (sendErr) {
        console.error("Failed to send notification for id", item.id, sendErr);
        await supabase
          .from("noticacoes")
          .update({ last_error: String(sendErr), attempts: (item.attempts ?? 0) + 1 })
          .eq("id", item.id);
      }
    }

    return new Response("Done");
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response("Internal error", { status: 500 });
  }
});







/**
 * Batch size para processar por execução
 */
const BATCH_SIZE = 20;


export async function requestNotificationPermission() {
  console.log("Solicitando permissão de notificação...");

  if (!("Notification" in window)) {
    console.warn("Navegador não suporta notificações.");
    return null;
  }

  // 1 — pede permissão
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.log("Permissão negada.");
    return null;
  }

  // 2 — registra SW
  const registration = await navigator.serviceWorker.register("/sw.js");

  // 3 — cria subscription Web Push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  console.log("Subscription criada:", subscription);

  // 4 — salva no banco
  const user = (await supabase.auth.getUser()).data.user;

  await supabase.from("notificacoes_subs").upsert({
    user_id: user.id,
    subscription: subscription.toJSON(),
  });

  return subscription;
}

/**
 * Converte a chave VAPID (base64) para UInt8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}


/**
 * Cria notificação no database
 */
export const createNotificacao = async (userId, message, sendAt, subscription = null) => {
  try {
    const { data, error } = await supabase
      .from("notificacoes")
      .insert({
        user_id: userId,
        message,
        send_at: sendAt,
        sent: false,
        subscription
      })
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.error("Erro ao criar notificação:", err);
    return null;
  }
};

/**
 * Buscar notificações não enviadas
 */
export const getNotificacoesNaoEnviadas = async (limit = BATCH_SIZE) => {
  try {
    const { data, error } = await supabase
      .from("notificacoes")
      .select("*")
      .eq("sent", false)
      .lte("send_at", new Date().toISOString())
      .order("send_at", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Erro ao buscar notificações:", err);
    return [];
  }
};

/**
 * Atualizar status de notificação como enviada
 */
export const markNotificacaoAsSent = async (id) => {
  try {
    const { data, error } = await supabase
      .from("notificacoes")
      .update({ sent: true, updated_at: new Date() })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.error("Erro ao atualizar notificação:", err);
    return null;
  }
};

/**
 * Gravar erro de envio (opcional: assume coluna last_error existe)
 */
export const markNotificacaoWithError = async (id, errorMessage) => {
  try {
    const { data, error } = await supabase
      .from("notificacoes")
      .update({ last_error: errorMessage, updated_at: new Date() })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.error("Erro ao registrar falha da notificação:", err);
    return null;
  }
};

/**
 * Deletar notificação
 */
export const deleteNotificacao = async (id) => {
  try {
    const { error } = await supabase
      .from("notificacoes")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Erro ao deletar notificação:", err);
    return false;
  }
};

/**
 * Enviar Web Push usando objeto PushSubscription
 * Nota: webpush.setVapidDetails(...) deve ser chamado em algum ponto de inicialização do seu servidor.
 */
export const sendWebPush = async (subscription, payload = {}) => {
  if (!subscription || !subscription.endpoint) {
    throw new Error("Subscription inválida para Web Push");
  }
  // payload pode ser um objeto; web-push espera string
  return webpush.sendNotification(subscription, JSON.stringify(payload));
};

/**
 * Enviar webhook genérico
 */
export const sendWebhook = async (subscription, payload = {}) => {
  const url = subscription?.url || subscription?.endpoint;
  if (!url) throw new Error("URL ausente para webhook");

  const headers = {
    "Content-Type": "application/json",
    ...(subscription.headers || {})
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    // timeout não é nativo em node-fetch v2; se necessário use AbortController
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "<no body>");
    throw new Error(`Webhook retornou ${res.status}: ${txt}`);
  }
  return res;
};

/**
 * Detecta o tipo de subscription e envia a notificação
 */
export const processAndSendNotification = async (row) => {
  const id = row.id;
  const subscription = row.subscription;
  const payload = {
    id: row.id,
    user_id: row.user_id,
    message: row.message,
    send_at: row.send_at
  };

  try {
    if (subscription && subscription.endpoint && subscription.keys) {
      // Web Push padrão
      await sendWebPush(subscription, { title: row.message, ...payload });
      await markNotificacaoAsSent(id);
      console.log("WebPush enviado:", id);
    } else if (subscription && (subscription.url || subscription.type === "webhook")) {
      // Webhook genérico
      await sendWebhook(subscription, payload);
      await markNotificacaoAsSent(id);
      console.log("Webhook enviado:", id);
    } else if (subscription && subscription.provider === "fcm" && subscription.token) {
      // Placeholder: implementação FCM não incluída
      throw new Error("Envio FCM não implementado aqui");
    } else {
      throw new Error("Formato de subscription desconhecido");
    }
  } catch (err) {
    console.error("Falha ao enviar notificação", id, err?.message || err);
    await markNotificacaoWithError(id, String(err?.message || err));
  }
};

/**
 * Runner: busca notificações pendentes e processa em sequência
 */
export const runNotificationWorker = async (limit = BATCH_SIZE) => {
  const pending = await getNotificacoesNaoEnviadas(limit);
  if (!pending.length) {
    console.log("Nenhuma notificação pendente");
    return;
  }
  console.log(`Processando ${pending.length} notificações...`);
  for (const row of pending) {
    // processa sequencialmente para evitar rate limits
    // se quiser paralelizar, use Promise.all com limites de concorrência
    // e trate rejections individualmente.
    // eslint-disable-next-line no-await-in-loop
    await processAndSendNotification(row);
  }
};
