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
- `links` — optional profile links (LinkedIn, GitHub…). Leave empty to hide.
- `hero`, `about`, `contact` — the main copy.

### Make the contact form send messages

By default `formEndpoint` is empty, so the form runs in **email-draft mode**: it opens a
pre-filled email to your address and says clearly on the page that nothing is sent from
the site. It never pretends a message was sent.

To receive submissions directly:

1. Create a form at a form backend that accepts JSON — e.g. Formspree (`https://formspree.io`), Getform or Basin.
2. Paste its endpoint into `formEndpoint`, e.g. `formEndpoint: "https://formspree.io/f/abcdwxyz"`.
3. Rebuild. The form now shows real *Sending… / sent / couldn't send* states based on the server's response.
   If the server returns an error, the visitor keeps their text and gets an email link instead.

The form posts: `name, email, message, service, timeline, budget, _subject, _replyto` and a
hidden `_gotcha` spam-trap field.

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
- `status` — be honest: `"Live"`, `"In development"` or `"Concept"`.
- `sampleData` — `true` if screens use fictional data (shows a notice).
- `problem`, `built`, `role` — shown in the featured section and the case study.
- `demoUrl` — **only** if a working demo exists. Leave it out and no demo link is shown.
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

Writes a static site to `out/`. Upload that folder to any static host (Netlify, Vercel,
Cloudflare Pages, GitHub Pages, S3…). Update `site.url` first so link previews work.

To regenerate the social-sharing image after changing the hero, take a 1200 × 630
screenshot of the top of the page and save it as `public/og.png`.

---

## 6. How the signature interactions behave

- **The data line (scroll):** one volt line starts at the accent block after "SMARTER" and
  draws itself down the page as you scroll (black over light sections). It routes through
  every element marked `data-line` — section labels, the small square "route" nodes inside
  each line-art scene, and invisible lanes at the top of light bands. Add `data-line` to any
  element to make the line pass through it; `data-turn="top"` makes it turn in the empty space
  at the top of that element's section. Code: `src/components/DataLine.tsx`.
- **Work stage (pointer images):** the full-screen dark section after the hero. Moving the
  mouse lays project screenshots along the pointer's path (bigger when you slow down); when
  you stop, the newest four glide into a resting stack. Screens come from `projects.ts`
  automatically. The index along the bottom holds the real links; hovering or keyboard-
  focusing one shows a steady preview. Touch and small screens get a swipe gallery; reduced
  motion shows the still stack. Code: `src/components/WorkStage.tsx`.
- **Line-art project scenes:** each featured project has a hand-drawn SVG scene in
  `src/components/Scenes.tsx`, keyed by project slug in `projectScenes`. A project without a
  scene automatically shows its screenshots instead, so new projects work straight away.
  The small paper cards on each scene are plain HTML inside the same file — edit their text there.
- **Transformation:** autoplays once inside the first project's band, can be paused, and every
  step is a button with a written caption.
