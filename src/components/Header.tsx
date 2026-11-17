"use client";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { Wordmark } from "./Wordmark";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className={`site-header ${scrolled || open ? "is-scrolled" : ""}`}>
        <div className="wrap">
          <Wordmark />
          <nav aria-label="Main">
            <ul className="nav-list">
              {site.nav.map((item, i) => (
                <li key={item.href}>
                  <a href={item.href}>
                    <span className="n" aria-hidden="true">0{i + 1}</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a href="/#contact" className="btn btn-primary header-cta">
            {site.hero.primaryCta} <span className="arr" aria-hidden="true">→</span>
          </a>
          <button
            className="menu-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Close" : "Menu"} <span className="bars" aria-hidden="true" />
          </button>
        </div>
      </header>
      <div id="mobile-menu" className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open} inert={!open}>
        <nav aria-label="Mobile">
          <ol>
            {site.nav.map((item, i) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setOpen(false)}>
                  {item.label} <span className="n">0{i + 1}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div style={{ display: "grid", gap: 16 }}>
          <a href="/#contact" className="btn btn-primary" onClick={() => setOpen(false)}>
            {site.hero.primaryCta} <span className="arr" aria-hidden="true">→</span>
          </a>
          <a href={`mailto:${site.email}`} className="mono muted" style={{ textTransform: "none" }}>
            {site.email}
          </a>
        </div>
      </div>
    </>
  );
}
