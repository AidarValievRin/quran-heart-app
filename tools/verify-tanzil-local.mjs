/**
 * Optional byte-level check against Tanzil `quran-uthmani.txt` (one ayah per line, 6236 lines).
 *
 * 1. Download the file from https://tanzil.net/download/ (Uthmani) or your approved mirror.
 * 2. Save as `tools/_tanzil-quran-uthmani.txt` (gitignored pattern in docs).
 * 3. Run: node tools/verify-tanzil-local.mjs
 *
 * Compares normalized text line-by-line with apps/mobile/src/data/quran/ayahs.bundle.json order.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TANZIL = join(ROOT, 'tools', '_tanzil-quran-uthmani.txt');
const BUNDLE = join(ROOT, 'apps', 'mobile', 'src', 'data', 'quran', 'ayahs.bundle.json');

function norm(s) {
  return String(s)
    .normalize('NFC')
    .replace(/\u200f|\u200e/g, '')
    .trim();
}

function main() {
  if (!existsSync(TANZIL)) {
    console.error(
      'Place Tanzil quran-uthmani.txt at tools/_tanzil-quran-uthmani.txt (see script header), then re-run.'
    );
    process.exit(2);
  }
  const bundle = JSON.parse(readFileSync(BUNDLE, 'utf8'));
  const ayahs = bundle.ayahs;
  const lines = readFileSync(TANZIL, 'utf8').split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length !== ayahs.length) {
    console.error(`Line count mismatch: tanzil=${lines.length} bundle=${ayahs.length}`);
    process.exit(1);
  }
  let mism = 0;
  for (let i = 0; i < ayahs.length; i++) {
    const a = ayahs[i];
    const t = norm(lines[i]);
    const b = norm(a.text);
    if (t !== b) {
      mism++;
      if (mism <= 5) {
        console.error(`Mismatch ${a.surah}:${a.ayah}\n  tanzil: ${t.slice(0, 80)}…\n  bundle: ${b.slice(0, 80)}…`);
      }
    }
  }
  if (mism) {
    console.error(`Total mismatches: ${mism}`);
    process.exit(1);
  }
  console.log('OK: bundle matches Tanzil line-by-line (', ayahs.length, 'ayahs)');
}

main();
