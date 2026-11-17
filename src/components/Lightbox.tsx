"use client";
import { useEffect, useRef, useState } from "react";
import type { ProjectImage } from "@/content/projects";

type Img = Pick<ProjectImage, "src" | "alt" | "width" | "height">;
type LenisLike = { stop: () => void; start: () => void };

/** Opens a screenshot in the accessible enlarged view. */
export function ZoomButton({ im, className = "", label = "Enlarge" }: { im: Img; className?: string; label?: string }) {
  return (
    <button
      type="button"
      className={`zoom-btn mono-sm ${className}`}
      onClick={() => window.dispatchEvent(new CustomEvent<Img>("db:zoom", { detail: im }))}
    >
      <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M1 4.5V1h3.5M11 7.5V11H7.5M7.5 1H11v3.5M4.5 11H1V7.5" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
      {label}<span className="visually-hidden">: {im.alt}</span>
    </button>
  );
}

/**
 * Enlarged screenshot view: a native modal <dialog> (focus is contained, Escape closes,
 * focus returns to the button that opened it). "Actual size" lets people inspect details;
 * long pages scroll inside the dialog.
 */
export function Lightbox() {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [im, setIm] = useState<Img | null>(null);
  const [actual, setActual] = useState(false);

  useEffect(() => {
    const onZoom = (e: Event) => {
      opener.current = document.activeElement as HTMLElement;
      setActual(false);
      setIm((e as CustomEvent<Img>).detail);
    };
    window.addEventListener("db:zoom", onZoom);
    return () => window.removeEventListener("db:zoom", onZoom);
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (!d || !im) return;
    if (!d.open) d.showModal();
    (window as unknown as { __lenis?: LenisLike }).__lenis?.stop();
  }, [im]);

  const close = () => ref.current?.close();
  const onClose = () => {
    (window as unknown as { __lenis?: LenisLike }).__lenis?.start();
    setIm(null);
    opener.current?.focus();
  };

  return (
    <dialog ref={ref} className="lightbox" aria-label={im ? `Enlarged screenshot: ${im.alt}` : "Enlarged screenshot"} onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) close(); }}>
      {im && (
        <div className="lb-inner">
          <div className="lb-bar">
            <p className="mono-sm lb-cap">{im.alt}</p>
            <div className="lb-actions">
              <button type="button" className="mono-sm lb-btn" aria-pressed={actual} onClick={() => setActual((a) => !a)}>
                {actual ? "Fit to screen" : "Actual size"}
              </button>
              <button type="button" className="mono-sm lb-btn lb-close" onClick={close} autoFocus>
                Close <span aria-hidden="true">✕</span>
              </button>
            </div>
          </div>
          <div className={`lb-view ${actual ? "is-actual" : ""}`} data-lenis-prevent tabIndex={0} aria-label="Screenshot — scroll to inspect">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={im.src} alt={im.alt} width={im.width} height={im.height} decoding="async" />
          </div>
        </div>
      )}
    </dialog>
  );
}
