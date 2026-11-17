# databridge — portfolio

Portfolio site for an independent designer/developer who builds websites and custom business systems.

- **Stack:** Next.js (App Router) + TypeScript, plain CSS, Lenis for smooth scrolling. Pages are pre-rendered; the only server code is the contact route.
- **Fonts:** Archivo Variable (display + text, via its width axis) and IBM Plex Mono, self-hosted.
- **Content:** everything editable lives in `src/content/` — see **[GUIDE.md](GUIDE.md)**.

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

Deploys to Vercel from this repository. See **GUIDE.md** for enabling real contact-form sending.
