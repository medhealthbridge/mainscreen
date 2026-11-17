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
 * without it) and decides whether the brand intro plays — first visit this session,
 * home page, no #deep-link, and motion allowed. Decided here so nothing flashes.
 */
const INTRO_DECISION = `(function(){var d=document.documentElement;d.classList.add('js');try{var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var seen=sessionStorage.getItem('db-intro');if(!r&&!seen&&location.pathname==='/'&&!location.hash){d.classList.add('intro')}}catch(e){}})()`;

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
  icons: { icon: "/icon.svg" },
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
        <a className="skip-link" href="#main">Skip to content</a>
        <BrandIntro />
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
