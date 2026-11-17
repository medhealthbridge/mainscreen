/**
 * SITE SETTINGS — edit this file to change your name, contact details and
 * the main copy. Everything here is plain text; no layout code.
 */

export const site = {
  /** Studio / personal name. Used in the wordmark, titles and footer. */
  name: "databridge",

  /**
   * The wordmark is built from two parts joined by the accent "bridge" bar.
   * Change these if your name changes, e.g. ["JANE", "DOE"].
   */
  wordmark: ["DATA", "BRIDGE"] as [string, string],

  /** Public contact address. Shown on the page and used for the email fallback. */
  email: "glenlozada0@gmail.com",

  /**
   * Where the contact form sends inquiries.
   *
   * Paste a form-backend endpoint that accepts a JSON POST and returns 2xx on
   * success — for example a Formspree form URL ("https://formspree.io/f/xxxxxxx"),
   * Getform, Basin, or your own API.
   *
   * Leave it empty and the form honestly switches to an "email draft" mode:
   * it opens a pre-filled email to `email` above, and says so on the page.
   * It never pretends a message was sent.
   */
  formEndpoint: "",

  /** Production URL, used for social-sharing metadata. No trailing slash. */
  url: "https://databridge-taupe.vercel.app",

  /** Page title and description for search engines and link previews. */
  title: "databridge — Websites and custom business systems",
  description:
    "I design and build websites that make your offer clear, and custom systems that make everyday work easier.",

  /** Optional profile links. Leave an array empty to hide them. */
  links: [
    // { label: "LinkedIn", href: "https://www.linkedin.com/in/..." },
    // { label: "GitHub", href: "https://github.com/..." },
  ] as { label: string; href: string }[],

  hero: {
    label: "Website design / Custom business systems",
    headline: ["Look sharp.", "Work smarter."],
    intro:
      "I design and build websites that make your offer clear, and custom systems that make everyday work easier.",
    primaryCta: "Discuss your project",
    secondaryCta: "Explore the work",
  },

  nav: [
    { label: "Work", href: "/#work" },
    { label: "What I build", href: "/#build" },
    { label: "Process", href: "/#process" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ],

  about: {
    heading: ["I start with how", "your business", "actually runs."],
    paragraphs: [
      "I'm an independent designer and developer. I work directly with owners and small teams — you talk to the person who designs and writes the code, and nothing gets lost between a salesperson, a designer and a developer.",
      "Most projects begin with a messy reality: an inbox full of booking requests, three spreadsheets that disagree, a website that doesn't say what you do. I map that reality first, then design the smallest clear thing that fixes it — and build it properly.",
    ],
    principles: [
      {
        title: "Plain language first",
        body: "If a screen or a page needs explaining, it isn't finished. I write and design for the people who'll use it every day.",
      },
      {
        title: "Working pieces, early",
        body: "You see real screens and clickable flows early, so decisions are made on something you can use — not a description of it.",
      },
      {
        title: "Built to hand over",
        body: "Clear structure, sensible tools and written notes, so the site or system stays understandable after launch.",
      },
    ],
  },

  contact: {
    heading: ["What would make", "your business", "work better?"],
    intro:
      "Tell me what's slowing you down or what you want to build. A few sentences is enough — I'll reply with questions or a suggested next step.",
  },
} as const;

export type Site = typeof site;
