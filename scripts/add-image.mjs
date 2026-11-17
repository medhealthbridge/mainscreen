// Converts a screenshot into the two WebP files the site uses.
// Usage: npm run image -- <source-image> <project-slug> <name>
// Example: npm run image -- ~/Desktop/dashboard.png fieldbook board
//   → public/work/fieldbook/board.webp        (max 1600 px wide)
//   → public/work/fieldbook/thumb/board.webp  (640 px wide, for the image trail)
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const [src, slug, name] = process.argv.slice(2);
if (!src || !slug || !name) {
  console.error("Usage: npm run image -- <source-image> <project-slug> <name>");
  process.exit(1);
}
const dir = join("public/work", slug);
mkdirSync(join(dir, "thumb"), { recursive: true });
const full = await sharp(src).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 84 }).toFile(join(dir, `${name}.webp`));
await sharp(src).resize({ width: 640 }).webp({ quality: 74 }).toFile(join(dir, "thumb", `${name}.webp`));
console.log(`✓ ${dir}/${name}.webp (${full.width} × ${full.height}) and thumb/${name}.webp`);
console.log(`  In projects.ts: img("${slug}", "${name}", "Describe the screen…", "desktop" | "page" | "mobile")`);
