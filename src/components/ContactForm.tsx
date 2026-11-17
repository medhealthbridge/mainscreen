"use client";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { needOptions } from "@/content/services";
import { useNeed } from "./NeedContext";
import { SERVICES, TIMELINES, validateContact, type FieldErrors } from "@/lib/contact";

type Status = "idle" | "sending" | "sent" | "error" | "drafted";
type Errors = FieldErrors;
/** "api": our server route is configured · "external": site.formEndpoint · "email": honest email draft. */
type Mode = "checking" | "api" | "external" | "email";

export function ContactForm() {
  const external = site.formEndpoint.trim();
  const [mode, setMode] = useState<Mode>(external ? "external" : "checking");
  const emailMode = mode === "email" || mode === "checking";
  const mountedAt = useRef(0);
  const { need } = useNeed();
  const [v, setV] = useState({ name: "", email: "", message: "", service: "", timeline: "", budget: "", _gotcha: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMsg, setServerMsg] = useState("");
  const lastStarter = useRef("");
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Is a real submission service configured on the server? (No credentials ever reach the browser.)
  useEffect(() => {
    mountedAt.current = Date.now();
    if (external) return;
    let alive = true;
    fetch("/api/contact/", { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : { configured: false }))
      .then((j: { configured?: boolean }) => alive && setMode(j.configured ? "api" : "email"))
      .catch(() => alive && setMode("email"));
    return () => { alive = false; };
  }, [external]);

  // Prefill from "What's slowing your business down?" without overwriting what someone typed.
  useEffect(() => {
    const o = needOptions.find((n) => n.id === need);
    if (!o) return;
    setV((cur) => {
      const canReplace = !cur.message.trim() || cur.message === lastStarter.current;
      lastStarter.current = o.starter;
      return { ...cur, service: o.service, message: canReplace ? o.starter : cur.message };
    });
  }, [need]);

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setV((cur) => ({ ...cur, [k]: e.target.value }));
    if (k in errors) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = (): Errors => validateContact(v);

  const body = () =>
    [
      v.message.trim(),
      "",
      `Name: ${v.name.trim()}`,
      `Email: ${v.email.trim()}`,
      v.service && `Service: ${v.service}`,
      v.timeline && `Timeline: ${v.timeline}`,
      v.budget.trim() && `Budget: ${v.budget.trim()}`,
    ].filter(Boolean).join("\n");

  const mailto = () =>
    `mailto:${site.email}?subject=${encodeURIComponent(`Project inquiry from ${v.name.trim() || "your website"}`)}&body=${encodeURIComponent(body())}`;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    const first = (["name", "email", "message"] as const).find((k) => er[k]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    if (emailMode) {
      window.location.href = mailto();
      setStatus("drafted");
      requestAnimationFrame(() => statusRef.current?.focus());
      return;
    }
    setStatus("sending");
    setServerMsg("");
    try {
      const url = mode === "external" ? external : "/api/contact/";
      const payload = mode === "external"
        ? { ...v, _subject: `Project inquiry from ${v.name.trim()}`, _replyto: v.email.trim() }
        : { ...v, _t: Date.now() - mountedAt.current };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({} as Record<string, unknown>));
      if (res.status === 422 && j && typeof j === "object" && "errors" in j && j.errors && !Array.isArray(j.errors)) {
        // Server-side validation: show the messages next to the fields, keep everything typed.
        const er = j.errors as Errors;
        setErrors(er);
        setStatus("idle");
        const first = (["name", "email", "message"] as const).find((k) => er[k]);
        if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
        return;
      }
      if (res.status === 503 && (j as { error?: string }).error === "not_configured") {
        setMode("email");
        throw new Error("Online sending isn't set up yet — use the email option below.");
      }
      // Success only when the server confirms the message was accepted.
      if (!res.ok || (mode === "api" && !(j as { ok?: boolean }).ok)) {
        const m = (j as { message?: string; error?: string }).message
          || (Array.isArray((j as { errors?: { message: string }[] }).errors) ? (j as { errors: { message: string }[] }).errors.map((x) => x.message).join(" ") : "")
          || (j as { error?: string }).error || "";
        throw new Error(m || `The server responded with ${res.status}.`);
      }
      setStatus("sent");
    } catch (err) {
      setServerMsg(err instanceof Error ? err.message.replace(/\.$/, "") : "");
      setStatus("error");
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  };

  if (status === "sent") {
    return (
      <div className="form-done" ref={statusRef} tabIndex={-1} role="status">
        <span className="tick" aria-hidden="true" />
        <h3>Thanks, {v.name.trim().split(" ")[0]} — your message was received.</h3>
        <p className="muted">It was accepted for delivery and I&apos;ll reply to <b>{v.email.trim()}</b>. If you haven&apos;t heard back within a couple of working days, please email <a className="link-u" href={`mailto:${site.email}`}>{site.email}</a> directly.</p>
      </div>
    );
  }

  const field = (k: "name" | "email", label: string, type: string, auto: string) => (
    <div className={`field-row ${errors[k] ? "has-error" : ""}`}>
      <label htmlFor={`f-${k}`}>{label} <span className="req" aria-hidden="true">*</span></label>
      <input
        id={`f-${k}`} name={k} type={type} autoComplete={auto} required
        value={v[k]} onChange={set(k)}
        aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `e-${k}` : undefined}
      />
      {errors[k] && <p className="err" id={`e-${k}`}>{errors[k]}</p>}
    </div>
  );

  return (
    <form ref={formRef} className="cform" onSubmit={onSubmit} noValidate aria-describedby="form-mode">
      {emailMode && (
        <p className="form-mode mono-sm" id="form-mode">
          <span className="fm-dot" aria-hidden="true" /> Email-draft mode: submitting opens a pre-filled email to {site.email} in your mail app. Nothing is sent from this page.
        </p>
      )}
      {!emailMode && <p className="visually-hidden" id="form-mode">Fields marked with an asterisk are required.</p>}

      <div className="cform-2">
        {field("name", "Your name", "text", "name")}
        {field("email", "Email", "email", "email")}
      </div>

      <div className={`field-row ${errors.message ? "has-error" : ""}`}>
        <label htmlFor="f-message">What do you need help with? <span className="req" aria-hidden="true">*</span></label>
        <textarea
          id="f-message" name="message" rows={5} required value={v.message} onChange={set("message")}
          aria-invalid={!!errors.message} aria-describedby={errors.message ? "e-message" : "h-message"}
        />
        {errors.message ? <p className="err" id="e-message">{errors.message}</p> : <p className="hint" id="h-message">What&apos;s slow, frustrating or missing today — a few sentences is plenty.</p>}
      </div>

      <fieldset className="field-row">
        <legend>Service <span className="opt">(optional)</span></legend>
        <div className="chips">
          {SERVICES.map((s) => (
            <label key={s} className={`chip ${v.service === s ? "on" : ""}`}>
              <input type="radio" name="service" value={s} checked={v.service === s} onChange={set("service")} />
              {s}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="cform-2">
        <div className="field-row">
          <label htmlFor="f-timeline">Timeline <span className="opt">(optional)</span></label>
          <select id="f-timeline" name="timeline" value={v.timeline} onChange={set("timeline")}>
            <option value="">Choose…</option>
            {TIMELINES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field-row">
          <label htmlFor="f-budget">Budget range <span className="opt">(optional)</span></label>
          <input id="f-budget" name="budget" type="text" placeholder="A rough range, or “not sure yet”" value={v.budget} onChange={set("budget")} />
        </div>
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor="f-gotcha">Leave this empty</label>
        <input id="f-gotcha" name="_gotcha" tabIndex={-1} autoComplete="off" value={v._gotcha} onChange={set("_gotcha")} />
      </div>

      <div className="cform-foot">
        <button type="submit" className="btn btn-primary" disabled={status === "sending"} aria-disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : emailMode ? "Open email draft" : "Send inquiry"} <span className="arr" aria-hidden="true">→</span>
        </button>
        <p className="mono-sm muted">Required: name, email, message.</p>
      </div>

      <div ref={statusRef} tabIndex={-1} className="form-status" role="status" aria-live="polite">
        {status === "sending" && <p>Sending your message…</p>}
        {status === "drafted" && (
          <p>
            Your email app should now be open with the message ready — <b>nothing has been sent yet</b>, so press send there.
            If it didn&apos;t open, email <a className="link-u" href={mailto()}>{site.email}</a> directly.
          </p>
        )}
        {status === "error" && (
          <p className="err-box">
            Sorry — your message couldn&apos;t be sent{serverMsg ? ` (${serverMsg})` : ""}. Your text is still here; please try again, or{" "}
            <a className="link-u" href={mailto()}>send it by email instead</a>.
          </p>
        )}
      </div>
    </form>
  );
}
