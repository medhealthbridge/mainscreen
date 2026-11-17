# Editing guide

Everything you'll normally change lives in **`src/content/`** and **`public/work/`**.
You don't need to touch layout code to update text, projects or contact details.

| What | Where |
| --- | --- |
| Name, wordmark, email, page title, hero copy, about, contact copy | `src/content/site.ts` |
| Projects (index, featured sections, case-study pages) | `src/content/projects.ts` |
| Project screenshots | `public/work/<project-slug>/` |
| The step-by-step demo inside a featured project | `src/content/transformation.ts` |
| Problems, services, process steps, FAQ | `src/content/services.ts` |
| Colours, fonts, spacing | `src/app/globals.css` (tokens at the top) |
| Social-sharing image / browser icon | `public/og.png`, `public/icon.svg` |

---

## 1. Your name and contact details — `src/content/site.ts`

- `name` — used in titles and the footer.
- `wordmark` — the two words either side of the yellow-green bar, e.g. `["DATA", "BRIDGE"]`.
- `email` — shown on the page and used by the email fallback.
- `url` — your live domain (no trailing slash). Used for link previews.
- `links` — your public profile links (LinkedIn, GitHub…). They appear in About and the footer. Leave empty to hide.
- `about` — the introduction. Add your public name there when you want it shown.
- `hero`, `about`, `contact` — the main copy.

### Make the contact form send messages

The form posts to the site's own server route, `src/app/api/contact/route.ts`, which
validates every field again on the server, checks a hidden honeypot field and a minimum
fill time, rate-limits repeated sends, and hands the message to **Resend**
(https://resend.com). The browser never sees any credentials.

Until it's configured, the form stays in its honest **email-draft mode**: it opens a
pre-filled email to your address and says so on the page. It never pretends a message was sent.

To switch on real sending, add these **environment variables in Vercel**
(Project → Settings → Environment Variables), then redeploy:

| Variable | Required | Value |
| --- | --- | --- |
| `RESEND_API_KEY` | yes | Your Resend API key (`re_…`) |
| `CONTACT_FROM` | recommended | A sender on a domain you've verified in Resend, e.g. `DataBridge <hello@yourdomain.com>`. Without it, Resend's test sender is used, which only delivers to the email that owns the Resend account. |
| `CONTACT_TO` | optional | Where inquiries go (defaults to `email` in `site.ts`) |

The form shows "received" only after Resend confirms it accepted the message. If anything
fails, visitors keep what they typed and get a ready-made email link instead.

(Alternative for other hosts: put a Formspree-style URL in `formEndpoint` in `site.ts`.)

---

## 2. Projects — `src/content/projects.ts`

The **first three** projects get large featured presentations (each with its own layout).
All projects appear in the project index, the image trail, the mobile gallery, and get a
case-study page at `/work/<slug>/`.

> The three included projects (Fieldbook, Halden Physio, Ledgerroom) are **concept
> placeholders with fictional sample data**. Replace them with your own work.

For each project set:

- `slug` — URL name, e.g. `"clinic-booking"` → `/work/clinic-booking/`.
- `name`, `offering` (`"Website"` or `"Business system"`), `category`, `serves`, `year`, `summary`.
- `status` — be precise: `"Visual concept"` (designed screens only), `"Functional prototype"`
  (a working demo with sample data), `"In development"` or `"Live"`.
- `brief.problem` / `brief.solution` — one line each, shown on the homepage. The longer
  `problem`, `built` and `caseStudy` text appears on the case-study page.
- `walkthroughUrl` — only if you have a real recorded walkthrough (e.g. an `.mp4` in `public/work/<slug>/`).
- `sampleData` — `true` if screens use fictional data (shows a notice).
- `problem`, `built`, `role` — shown in the featured section and the case study.
- `demoUrl` — **only** if a working prototype or live site exists. Leave it out and no link is shown.
- `needs` — which "What's slowing your business down?" answers it's relevant to:
  `"website"`, `"manual"`, `"system"`, `"unsure"`.
- `caseStudy` — `context`, `constraints`, `decisions`, `solution`, `outcome`.
  Set `outcomeLabel: "Outcome"` **only** when you have real evidence; otherwise keep
  `"Intended benefit"` and describe what the work is designed to improve.

### Screenshots

Put images in `public/work/<slug>/` and list them in the project's `images` with the
`img(slug, file, alt, kind)` helper:

- `kind: "desktop"` — a screen at **1600 × 1000** (16:10).
- `kind: "page"` — a full-length web page at **1600 wide** (taller is fine; it scrolls on hover).
  The helper assumes 1600 × 3400 — change the size in the helper if yours differs.
- `kind: "mobile"` — a phone screen at **780 × 1688**.
- Each image also needs a lighter copy at `public/work/<slug>/thumb/<file>.webp`
  (~640 px wide) — used by the moving image trail so it stays smooth.

The quickest way to make both files from a screenshot (PNG, JPG or WebP):

```bash
npm run image -- path/to/screenshot.png my-project screen-name
```

That writes `public/work/my-project/screen-name.webp` and its `thumb/` copy, and prints the
line to add to `projects.ts`.

Order matters: the first wide image is the cover; a `"page"` image is used for the
scrolling browser in the second featured layout; the first `"mobile"` image goes in
the phone frames.

Give each image a real `alt` description — it's what screen-reader users get.

### The included placeholder mockups

The placeholder screens were generated from `scripts/mockups/*.html` with
`npm run mockups` (needs Playwright + Chromium). You can delete `scripts/mockups/` and the
placeholder folders in `public/work/` once your real projects are in.

---

## 3. The featured demo — `src/content/transformation.ts`

The "How the system works" sequence (scattered → organised → usable → done) is attached
to the project whose slug matches `projectSlug`. Edit the step captions, the six items
and the detail panel text. If none of your projects suit it, set `projectSlug` to `""`
and the demo is hidden.

---

## 4. Services, problems, process, FAQ — `src/content/services.ts`

- `needOptions` — the four optional answers. `service` pre-selects the form's service
  type; `starter` pre-fills the message (only if the visitor hasn't typed anything).
- `problems` — each recognisable problem, its solution, the service it belongs to, and an
  optional related project `slug`.
- `services` — the two service groups. Only list services you actually offer.
- `process` — the four stages, with "your part" and "you get" for each.
- `faq` — **review these answers** so they match how you actually work (ownership,
  support, etc.). No prices, deadlines or guarantees are included.

---

## 5. Run, build, deploy

```bash
npm install
```

```bash
npm run dev
```

Opens at http://localhost:3000.

```bash
npm run build
```

Checks that everything builds. The live site is on Vercel (project "databridge") and
redeploys automatically on every push to the connected branch. Pages are pre-rendered;
`/api/contact` runs on Vercel's servers. Keep `site.url` set to your live domain so link
previews work.

To regenerate the social-sharing image after changing the hero, take a 1200 × 630
screenshot of the top of the page and save it as `public/og.png`.

---

## 6. How the signature interactions behave

- **Brand intro** (`BrandIntro.tsx`, styles at the end of `globals.css`): two lime endpoints,
  a connector, one signal, then the dash of DATA—BRIDGE and the words; it settles into the
  header in about a second. It plays once per browser session, only on the home page, never
  for `#deep-links`, and never with reduced motion. The page underneath is live the whole
  time; any scroll, tap or key press fast-forwards it.
- **Hero diagram** (`HeroDiagram.tsx`): three loose nodes join and feed the lime square.
  Shown only where there's room (wide screens).
- **The data line** (`DataLine.tsx`): starts at the hero's lime square and draws down the
  page as you scroll, through the side margins and empty section padding. Nodes light up
  when it reaches them and a small signal travels between them. Off on phones.
  To route it through an element, add `data-line`; `data-turn="top"` / `"scene"` / `"<px>"`
  sets where it curves in, and `data-h` limits the curve height. After moving anchors, check at
  several widths that the line never crosses text, buttons or screenshots.
- **Work stage** (`WorkStage.tsx`): up to seven screenshots follow the pointer and settle into
  a stack when it stops. The project index below holds the real links. Touch screens get a
  swipe gallery with a counter and previous/next buttons.
- **Enlarged screenshots** (`Lightbox.tsx`): any "Enlarge" button opens the image in an
  accessible dialog with "Actual size" for inspecting details; Escape closes it.
- **Transformation demo** (`Transformation.tsx`, text in `content/transformation.ts`):
  Scattered → Structured → Scheduled → Completed. Autoplays once; clicking a step stops it;
  Replay restarts it. Reduced motion shows a static, step-by-step version.
