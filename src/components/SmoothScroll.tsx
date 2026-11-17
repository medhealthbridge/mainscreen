"use client";
import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Smooth wheel/trackpad scrolling (Lenis). Native scroll position, keyboard
 * scrolling, find-in-page and touch scrolling all keep working. Disabled
 * automatically for prefers-reduced-motion. Anchor links glide with a header offset.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1,
      anchors: { offset: -72 },
      autoRaf: true,
      // Let the horizontal swipe galleries scroll natively.
      prevent: (node) => !!node.closest?.(".ws-gallery"),
    });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    window.dispatchEvent(new Event("lenisready"));
    return () => { lenis.destroy(); delete (window as unknown as { __lenis?: Lenis }).__lenis; };
  }, []);
  return null;
}
