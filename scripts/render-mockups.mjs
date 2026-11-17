// Renders the placeholder project mockups in scripts/mockups/*.html into
// optimised WebP images under public/work/<slug>/ (full size + /thumb/ for the
// pointer trail). Run with `npm run mockups`.
//
// You only need this for the built-in concept placeholders. For real projects,
// export your screenshots directly into public/work/<slug>/ (see GUIDE.md).
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // uses the globally installed Playwright
import sharp from "sharp";
import { readdirSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "scripts/mockups");
const only = process.argv[2];

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1000, height: 1000 } });

for (const file of readdirSync(dir).filter((f) => f.endsWith(".html"))) {
  if (only && !file.startsWith(only)) continue;
  await page.goto(pathToFileURL(join(dir, file)).href);
  await page.evaluate(async () => { await Promise.all([...document.fonts].map((f) => f.load().catch(() => {}))); await document.fonts.ready; });
  const shots = await page.$$("[data-shot]");
  for (const el of shots) {
    const name = await el.getAttribute("data-shot");
    const png = await el.screenshot({ type: "png" });
    const out = join(root, "public/work", `${name}.webp`);
    const thumb = join(root, "public/work", dirname(name), "thumb", `${name.split("/").pop()}.webp`);
    mkdirSync(dirname(out), { recursive: true });
    mkdirSync(dirname(thumb), { recursive: true });
    await sharp(png).webp({ quality: 84 }).toFile(out);
    await sharp(png).resize({ width: 640 }).webp({ quality: 74 }).toFile(thumb);
    console.log("✓", name);
  }
}
await browser.close();
