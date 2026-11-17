import { NextResponse } from "next/server";
import { site } from "@/content/site";
import { validateContact, type ContactInput } from "@/lib/contact";

/**
 * POST /api/contact/ — receives project inquiries.
 *
 * Delivery: Resend (https://resend.com) via its HTTP API. Configure on the server only:
 *   RESEND_API_KEY   required — enables real submissions
 *   CONTACT_TO       optional — recipient (defaults to site.email)
 *   CONTACT_FROM     optional — verified sender, e.g. "DataBridge <hello@yourdomain.com>"
 *                    (defaults to Resend's test sender, which only delivers to the Resend account owner)
 * Without RESEND_API_KEY the route answers 503 "not_configured" and the form keeps its
 * honest email-draft mode. Success is returned only after Resend accepts the message.
 *
 * Spam protection: hidden honeypot field, minimum fill time, same-origin check,
 * and a per-address rate limit (best effort, per server instance).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

const configured = () => !!process.env.RESEND_API_KEY;
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  return json({ configured: configured() });
}

export async function POST(req: Request) {
  // Same-origin only (browsers always send Origin on cross-site POSTs).
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return json({ error: "forbidden" }, 403);

  if (!configured()) return json({ error: "not_configured" }, 503);

  const raw = await req.text();
  if (raw.length > 20_000) return json({ error: "too_large" }, 413);
  let data: ContactInput & { _gotcha?: string; _t?: number };
  try { data = JSON.parse(raw); } catch { return json({ error: "bad_request" }, 400); }

  // Spam checks: the honeypot must be empty and the form must have been open for a few seconds.
  if (data._gotcha) return json({ error: "rejected", message: "This submission couldn't be accepted." }, 400);
  if (typeof data._t !== "number" || data._t < 2500) {
    return json({ error: "too_fast", message: "That was very quick — please wait a moment and send again." }, 400);
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return json({ error: "rate_limited", message: "Too many messages in a short time — please try again in a few minutes, or email directly." }, 429);

  const input: ContactInput = {
    name: String(data.name ?? ""),
    email: String(data.email ?? ""),
    message: String(data.message ?? ""),
    service: data.service ? String(data.service) : "",
    timeline: data.timeline ? String(data.timeline) : "",
    budget: data.budget ? String(data.budget) : "",
  };
  const errors = validateContact(input);
  if (Object.keys(errors).length) return json({ error: "invalid", errors }, 422);

  recent.push(now);
  hits.set(ip, recent);

  const lines = [input.message.trim(), "", `Name: ${input.name.trim()}`, `Email: ${input.email.trim()}`];
  if (input.service) lines.push(`Service: ${input.service}`);
  if (input.timeline) lines.push(`Timeline: ${input.timeline}`);
  if (input.budget?.trim()) lines.push(`Budget: ${input.budget.trim()}`);
  lines.push("", `Sent from the ${site.name} website contact form.`);
  const text = lines.join("\n");

  try {
    const res = await fetch(process.env.RESEND_API_URL || "https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || `${site.name} website <onboarding@resend.dev>`,
        to: [process.env.CONTACT_TO || site.email],
        reply_to: input.email.trim(),
        subject: `Project inquiry from ${input.name.trim()}`,
        text,
      }),
    });
    const out = (await res.json().catch(() => ({}))) as { id?: string };
    if (!res.ok || !out.id) return json({ error: "delivery_failed", message: "The message couldn't be handed to the email service." }, 502);
    return json({ ok: true, id: out.id });
  } catch {
    return json({ error: "delivery_failed", message: "The email service couldn't be reached." }, 502);
  }
}
