/**
 * Shared contact-form rules — used by the browser for instant feedback and by the
 * server route as the source of truth. Required: name, email, message.
 */
export const SERVICES = ["Website", "Business system", "Both", "Not sure"] as const;
export const TIMELINES = ["Not decided yet", "As soon as possible", "In the next 1–3 months", "Later this year"] as const;

export type ContactInput = {
  name: string;
  email: string;
  message: string;
  service?: string;
  timeline?: string;
  budget?: string;
};
export type FieldErrors = Partial<Record<"name" | "email" | "message" | "service" | "timeline" | "budget", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(v: ContactInput): FieldErrors {
  const e: FieldErrors = {};
  const name = (v.name ?? "").trim();
  const email = (v.email ?? "").trim();
  const message = (v.message ?? "").trim();
  if (!name) e.name = "Please enter your name.";
  else if (name.length > 120) e.name = "Please keep your name under 120 characters.";
  if (!email) e.email = "Please enter your email so I can reply.";
  else if (email.length > 254 || !EMAIL.test(email)) e.email = "That email address doesn't look complete — please check it.";
  if (message.length < 10) e.message = "Please add a sentence or two about what you need help with.";
  else if (message.length > 5000) e.message = "Please keep your message under 5,000 characters.";
  if (v.service && !(SERVICES as readonly string[]).includes(v.service)) e.service = "Please choose one of the listed options.";
  if (v.timeline && !(TIMELINES as readonly string[]).includes(v.timeline)) e.timeline = "Please choose one of the listed options.";
  if (v.budget && v.budget.length > 120) e.budget = "Please keep this under 120 characters.";
  return e;
}
