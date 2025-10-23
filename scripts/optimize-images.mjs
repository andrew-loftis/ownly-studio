import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(process.cwd(), 'public');
const exts = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function* walk(dir) {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else if (exts.has(path.extname(d.name).toLowerCase())) yield entry;
  }
}

async function run() {
  let count = 0;
  for await (const file of walk(root)) {
    const outWebp = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    try {
      const img = sharp(file);
      const { width } = await img.metadata();
      const target = width && width > 1920 ? 1920 : width || 0;
      await img
        .resize(target || undefined)
        .webp({ quality: 82 })
        .toFile(outWebp);
      count++;
      // Optionally keep originals; uncomment to remove
      // await fs.promises.unlink(file);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('optimize skip', file, e?.message);
    }
  }
  // eslint-disable-next-line no-console
  console.log(`optimized ${count} images`);
}

run();
