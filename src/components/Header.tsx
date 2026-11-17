"use client";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { Wordmark } from "./Wordmark";

/** Transparent header that switches to dark text over light sections. */
export function Header() {
  const [onLight, setOnLight] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const els = document.elementsFromPoint(window.innerWidth / 2, 32);
      const under = els.find((el) => !ref.current?.contains(el) && !el.closest(".mobile-menu"));
      setOnLight(!!under?.closest(".sec-light, [data-theme='light']"));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    if (open) lenis?.stop(); else lenis?.start();
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header ref={ref} className={`site-header ${onLight && !open ? "on-light" : ""}`}>
        <div className="wrap">
          <Wordmark />
          <nav aria-label="Main">
            <ul className="nav-list">
              {site.nav.map((item) => (
                <li key={item.href}><a href={item.href}>{item.label}</a></li>
              ))}
            </ul>
          </nav>
          <a href="/#contact" className="header-cta">
            <span>{site.hero.primaryCta}</span><span className="sq" aria-hidden="true" />
          </a>
          <button className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
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
          <a href={`mailto:${site.email}`} className="mono muted" style={{ textTransform: "none" }}>{site.email}</a>
        </div>
      </div>
    </>
  );
}
