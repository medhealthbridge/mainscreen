"use client";
import { useState } from "react";
import { site } from "@/content/site";
import { ContactForm } from "./ContactForm";

function Marquee() {
  const items = ["Start a project", "Tell me what’s slowing you down", "Websites", "Business systems"];
  const run = (
    <span className="mq-run">
      {items.map((t) => (
        <span key={t} className="mq-item">{t}<span className="mq-sq" aria-hidden="true" /></span>
      ))}
    </span>
  );
  return (
    <a href="#contact-form" className="marquee" aria-label="Start a project — go to the inquiry form">
      <span className="mq-track" aria-hidden="true">{run}{run}{run}</span>
    </a>
  );
}

export function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(site.email); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch {}
  };
  return (
    <section id="contact" className="contact sec-dark" aria-labelledby="contact-title">
      <Marquee />
      <div className="wrap">
        <p className="mono stage-label"><span className="node" aria-hidden="true" data-line="" />05 — Launch</p>
        <h2 id="contact-title" className="display contact-h mask-lines">
          {site.contact.heading.map((l, i) => (
            <span className="ml" key={l} style={{ paddingLeft: i === 1 ? "0.9em" : 0 }}><span style={{ "--i": i } as React.CSSProperties}>{l}</span></span>
          ))}
        </h2>
        <div className="contact-grid" id="contact-form">
          <div className="contact-side">
            <p className="lead pretty">{site.contact.intro}</p>
            <div className="direct">
              <p className="mono-sm muted">Prefer email?</p>
              <a href={`mailto:${site.email}`} className="direct-mail">{site.email}</a>
              <button type="button" className="mono-sm copy" onClick={copy}>{copied ? "Copied ✓" : "Copy address"}</button>
              <span className="visually-hidden" aria-live="polite">{copied ? "Email address copied" : ""}</span>
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
