"use client";
import { useState } from "react";
import { site } from "@/content/site";
import { ContactForm } from "./ContactForm";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(site.email); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch {}
  };
  return (
    <section id="contact" className="sec sec-dark contact" aria-labelledby="contact-title">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono idx"><b>05</b> Contact</span>
          <span className="mono">Start a conversation</span>
        </div>
        <h2 id="contact-title" className="display contact-h mask-lines">
          {site.contact.heading.map((l, i) => (
            <span className="ml" key={l}><span style={{ "--i": i } as React.CSSProperties}>{l}</span></span>
          ))}
        </h2>
        <div className="contact-grid">
          <div className="contact-side">
            <p className="lead pretty">{site.contact.intro}</p>
            <div className="direct">
              <p className="mono-sm muted">Prefer email?</p>
              <a href={`mailto:${site.email}`} className="direct-mail">{site.email}</a>
              <button type="button" className="mono-sm copy" onClick={copy}>
                {copied ? "Copied ✓" : "Copy address"}
              </button>
              <span className="visually-hidden" aria-live="polite">{copied ? "Email address copied" : ""}</span>
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
