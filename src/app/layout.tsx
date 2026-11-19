import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import "./sections.css";
import { site } from "@/content/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RevealObserver } from "@/components/RevealObserver";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Lightbox } from "@/components/Lightbox";
import { BrandIntro } from "@/components/BrandIntro";

/**
 * Runs before first paint: marks JS as available (reveal animations never hide content
 * without it) and decides whether the first-visit loading screen plays — first visit this
 * session, home page, no #deep-link, motion allowed. Decided here so nothing flashes.
 * It also wires the ways out *before* the app hydrates, so nobody is ever stranded:
 * the "Skip intro" button (or any click on the screen), Escape, scroll gestures and keys,
 * and a hard 5-second timeout. `window.__dbIntroDone()` ends it.
 */
const INTRO_DECISION = `(function(){var d=document.documentElement;d.classList.add('js');try{if(matchMedia('(prefers-reduced-motion: reduce)').matches||sessionStorage.getItem('db-intro')||location.pathname!=='/'||location.hash)return;d.classList.add('intro');sessionStorage.setItem('db-intro','1');var ev=['click','keydown','wheel','touchmove'],keys={Escape:1,' ':1,PageDown:1,ArrowDown:1,End:1},skip,done=function(){if(d.classList.contains('intro-done'))return;d.classList.add('intro-done');ev.forEach(function(t){removeEventListener(t,skip,true)});window.dispatchEvent(new Event('db:intro-done'))};skip=function(e){if(e.type==='keydown'&&!keys[e.key])return;if(e.type==='click'&&!(e.target.closest&&e.target.closest('.ld')))return;d.classList.add('intro-skip');done()};ev.forEach(function(t){addEventListener(t,skip,{passive:true,capture:true})});window.__dbIntroDone=done;setTimeout(done,5000)}catch(e){}})()`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.title,
    description: site.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name} — websites and custom business systems` }],
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description, images: ["/og.png"] },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Marks JS as available so reveal animations never hide content without it. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_DECISION }} />
      </head>
      <body>
        <BrandIntro />
        <a className="skip-link" href="#main">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <RevealObserver />
        <SmoothScroll />
        <Lightbox />
      </body>
    </html>
  );
}
