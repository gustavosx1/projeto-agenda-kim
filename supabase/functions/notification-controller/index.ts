
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "../../../src/database/supabase.js"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

function isWebhookSubscription(sub: any): sub is { url: string; headers?: Record<string, string> } {
  return sub && typeof sub === "object" && typeof sub.url === "string" && sub.url.length > 0;
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 10_000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const text = await res.text().catch(() => "");
    return { ok: res.ok, status: res.status, body: text };
  } finally {
    clearTimeout(id);
  }
}

// Helper: create notification in DB
export async function createNotification(payload: { user_id: string; subscription: any; message: string; send_at: string }) {
  const { user_id, subscription, message, send_at } = payload;
  if (!user_id || !subscription || !message || !send_at) {
    throw new Error('Missing fields');
  }
  const { data, error } = await supabase
    .from('notificacoes')
    .insert({ user_id, subscription, message, send_at, sent: false })
    .select()
    .limit(1);
  if (error) throw error;
  return data?.[0] ?? null;
}

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname.replace(/\/$/, "");

    if (req.method === "POST" && pathname.endsWith("/create")) {
      const body = await req.json().catch(() => null);
      if (!body) return json({ error: 'invalid_body' }, 400);
      try {
        const notif = await createNotification(body);
        return json({ ok: true, notification: notif });
      } catch (err) {
        console.error('createNotification error', err);
        return json({ error: 'create_error', details: String(err) }, 500);
      }
    }

    if (req.method === "POST" && pathname.endsWith("/subscribe")) {
      const body = await req.json().catch(() => null);
      if (!body || !body.user_id || !body.subscription || !body.message || !body.send_at) {
        return json({ error: "Missing required fields: user_id, subscription, message, send_at" }, 400);
      }

      if (!isWebhookSubscription(body.subscription)) {
        return json({ error: "Only webhook subscriptions (subscription.url) are accepted" }, 400);
      }

      try {
        const notif = await createNotification(body);
        return json({ ok: true, notification: notif });
      } catch (err) {
        console.error('DB insert error:', err);
        return json({ error: 'db_insert_error', details: String(err) }, 500);
      }
    }

    if (req.method === "GET" && pathname.endsWith("/pending")) {
      const { data, error } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("sent", false)
        .lte("send_at", new Date().toISOString())
        .order("send_at", { ascending: true })
        .limit(100);

      if (error) {
        console.error("DB fetch pending error:", error);
        return json({ error: "db_fetch_error", details: error }, 500);
      }

      return json({ ok: true, pending: data || [] });
    }

    if (req.method === "POST" && pathname.endsWith("/send-pending")) {
      const provided = req.headers.get("x-service-role") || "";
      if (provided !== SUPABASE_SERVICE_ROLE_KEY) {
        return json({ error: "unauthorized" }, 401);
      }

      const { data: pending, error: fetchErr } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("sent", false)
        .lte("send_at", new Date().toISOString())
        .order("send_at", { ascending: true })
        .limit(100);

      if (fetchErr) {
        console.error("DB fetch pending error:", fetchErr);
        return json({ error: "db_fetch_error", details: fetchErr }, 500);
      }

      const results: Array<{ id: string; ok: boolean; status?: number; error?: string }> = [];

      for (const row of pending || []) {
        const id = row.id;
        const subscription = row.subscription;
        const payload = {
          id: row.id,
          user_id: row.user_id,
          message: row.message,
          send_at: row.send_at,
        };

        if (!isWebhookSubscription(subscription)) {
          console.warn("Skipping non-webhook subscription for id:", id);
          await supabase
            .from("notificacoes")
            .update({ sent: true })
            .eq("id", id);
          results.push({ id, ok: false, error: "invalid_subscription" });
          continue;
        }

        try {
          const headers = {
            "Content-Type": "application/json",
            ...(subscription.headers || {}),
          };

          const res = await fetchWithTimeout(subscription.url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          }, 10_000);

          if (res.ok) {
            await supabase.from("notificacoes").update({ sent: true }).eq("id", id);
            results.push({ id, ok: true, status: res.status });
          } else {
            console.error("Webhook failed", subscription.url, res.status, res.body);
            await supabase
              .from("notificacoes")
              .update({ sent: false })
              .eq("id", id);
            results.push({ id, ok: false, status: res.status, error: res.body || `status_${res.status}` });
          }
        } catch (err) {
          console.error("Error sending webhook for id", id, err);
          await supabase
            .from("notificacoes")
            .update({ sent: false })
            .eq("id", id);
          results.push({ id, ok: false, error: String(err?.message || err) });
        }
      }

      return json({ ok: true, results });
    }

    return json({ error: "not_found" }, 404);
  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: "unexpected_error", details: String(err) }, 500);
  }
});
