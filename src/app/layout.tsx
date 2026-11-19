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
import { ALL_ASSETS, ART, EDGE, SIGNATURE_URL } from "@/lib/introAssets";

/**
 * Runs before first paint. Marks JS as available (reveal animations never hide content
 * without it) and decides whether the first-visit intro plays: first visit this session,
 * home page, no #deep-link, motion allowed. It then
 *  · wires the ways out before the app hydrates — "Skip intro" (or any click on the
 *    screen), Escape, scroll gestures and keys — plus a hard stop;
 *  · preloads and decodes the bridge artwork, and only starts the intro (`ld-go`) once
 *    it is ready; if it takes longer than 1.8 s the site is shown instead;
 *  · works out the match-cut for this viewport (where the piece's stepped edge lands on
 *    screen and how big the symbol must be to share it) as CSS custom properties.
 * `window.__dbIntroDone()` ends the intro.
 */
const LOCKUP_EM = 10.82; // width of the lockup in em (symbol, gap, DATA, bridge dash, BRIDGE)
const BOOT = { sig: SIGNATURE_URL, src: ALL_ASSETS, w: ART.w, h: ART.h, ex: EDGE.x, ey: EDGE.y, u: EDGE.unit, lw: LOCKUP_EM };
const INTRO_DECISION = `(function(){var d=document.documentElement;d.classList.add('js');try{
if(matchMedia('(prefers-reduced-motion: reduce)').matches||sessionStorage.getItem('db-intro')||location.pathname!=='/'||location.hash)return;
d.classList.add('intro');sessionStorage.setItem('db-intro','1');
var ev=['click','keydown','wheel','touchmove'],keys={Escape:1,' ':1,PageDown:1,ArrowDown:1,End:1},skip;
var done=function(){if(d.classList.contains('intro-done'))return;d.classList.add('intro-done');ev.forEach(function(t){removeEventListener(t,skip,true)});window.dispatchEvent(new Event('db:intro-done'))};
skip=function(e){if(e.type==='keydown'&&!keys[e.key])return;if(e.type==='click'&&!(e.target.closest&&e.target.closest('.ld')))return;d.classList.add('intro-skip');done()};
ev.forEach(function(t){addEventListener(t,skip,{passive:true,capture:true})});window.__dbIntroDone=done;
var A=${JSON.stringify(BOOT)},left=A.src.length+1,gate=setTimeout(done,1800),sig='';
var go=function(){if(d.classList.contains('intro-done'))return;clearTimeout(gate);
var vw=innerWidth,vh=innerHeight,zoom=vw>=761&&vh>=500,Z=zoom?2.2:1,k=Math.min(vw,vh*A.w/A.h)/A.w,
ex=vw/2+(A.ex-A.w/2)*k,ey=vh/2+(A.ey-A.h/2)*k,u=A.u*k*Z,F=Math.min(.86*vw,946)/A.lw,cx=vw/2-A.lw*F/2+.706*F,s=d.style;
s.setProperty('--ld-vw',vw+'px');s.setProperty('--ld-vh',vh+'px');s.setProperty('--ld-F',F+'px');
s.setProperty('--ld-tx',(ex-cx)+'px');s.setProperty('--ld-ty',(ey-3*u-vh/2)+'px');s.setProperty('--ld-ts',(24*u/(1.412*F)).toFixed(4));
var w=document.querySelector('.ld-sigwrap');if(w)w.innerHTML=sig;d.classList.add(zoom?'ld-zoom':'ld-still');d.classList.add('ld-go');setTimeout(done,5200)};
var one=function(){if(--left===0)go()};
fetch(A.sig).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(t){sig=t;one()},done);
A.src.forEach(function(url){var i=new Image();i.onload=function(){var p=i.decode&&i.decode();if(p&&p.then)p.then(one,one);else one()};i.onerror=done;i.src=url});
}catch(e){}})()`;

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
