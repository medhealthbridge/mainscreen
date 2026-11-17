"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { Wordmark } from "./Wordmark";

type LenisLike = { stop: () => void; start: () => void; scrollTo: (t: Element | number, o?: { offset?: number; immediate?: boolean }) => void };
const lenis = () => (window as unknown as { __lenis?: LenisLike }).__lenis;

/**
 * Fixed header. Transparent over the hero; once the page scrolls it gains a solid,
 * blurred backing (dark over dark sections, ivory over light ones) so content and the
 * data line never show through the navigation.
 */
export function Header() {
  const [onLight, setOnLight] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      setSolid(window.scrollY > 12);
      const els = document.elementsFromPoint(window.innerWidth / 2, 40);
      const under = els.find((el) => !ref.current?.contains(el) && !el.closest(".mobile-menu") && !el.closest(".dataline"));
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

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) requestAnimationFrame(() => btnRef.current?.focus());
  }, []);

  // Mobile menu: lock scroll, move focus in, keep Tab inside, Escape closes.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) lenis()?.stop(); else lenis()?.start();
    if (!open) return;
    const menu = menuRef.current;
    const focusables = () => [btnRef.current, ...Array.from(menu?.querySelectorAll<HTMLElement>("a[href], button") ?? [])].filter(Boolean) as HTMLElement[];
    requestAnimationFrame(() => menu?.querySelector<HTMLElement>("a[href]")?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      const f = focusables();
      const i = f.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Menu links: close first, then glide to the section (works with or without Lenis).
  const go = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href") ?? "";
    const id = href.split("#")[1];
    const target = id && window.location.pathname === "/" ? document.getElementById(id) : null;
    close(false);
    if (!target) return;
    e.preventDefault();
    requestAnimationFrame(() => {
      lenis()?.start();
      if (lenis()) lenis()!.scrollTo(target);
      else target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      history.replaceState(null, "", `#${id}`);
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  };

  const cls = ["site-header", onLight && !open ? "on-light" : "", solid && !open ? "is-solid" : ""].join(" ");

  return (
    <>
      <header ref={ref} className={cls}>
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
          <button ref={btnRef} className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" onClick={() => (open ? close() : setOpen(true))}>
            {open ? "Close" : "Menu"} <span className="bars" aria-hidden="true" />
          </button>
        </div>
      </header>
      <div id="mobile-menu" ref={menuRef} className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open} inert={!open}>
        <nav aria-label="Mobile">
          <ol>
            {site.nav.map((item, i) => (
              <li key={item.href}>
                <a href={item.href} onClick={go}>
                  {item.label} <span className="n">0{i + 1}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div style={{ display: "grid", gap: 16 }}>
          <a href="/#contact" className="btn btn-primary" onClick={go}>
            {site.hero.primaryCta} <span className="arr" aria-hidden="true">→</span>
          </a>
          <a href={`mailto:${site.email}`} className="mono muted mm-mail">{site.email}</a>
        </div>
      </div>
    </>
  );
}
